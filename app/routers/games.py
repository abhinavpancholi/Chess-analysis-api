from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.game import Game, IngestionJob
from app.schemas.game import (
    IngestRequest, IngestResponse,
    JobStatusResponse, GameResponse
)
from app.services import chess_com, pgn_parser

router = APIRouter(prefix="/games", tags=["games"])


# ─────────────────────────────────────────────
# Background task — the actual ingestion logic
# ─────────────────────────────────────────────

async def run_ingestion(
    job_id: int,
    user_id: int,
    chess_username: str,
    year: Optional[int],
    month: Optional[int],
):
    """
    Runs after the HTTP response is sent.
    Fetches games from chess.com, parses them, stores in DB.
    Updates job status throughout.
    """
    from app.database import AsyncSessionLocal  # local import avoids circular imports

    async with AsyncSessionLocal() as db:
        # 1. Mark job as running
        job_result = await db.execute(
            select(IngestionJob).where(IngestionJob.id == job_id)
        )
        job = job_result.scalar_one()
        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        await db.commit()

        try:
            # 2. Decide which months to fetch
            if year and month:
                # specific month requested
                # months_to_fetch = [
                #     f"{chess_com.CHESS_COM_BASE_URL_PLACEHOLDER}/{year}/{month:02d}"
                # ]
                # we build the URL manually below — just store year/month
                game_lists = [
                    await chess_com.get_games_for_month(year, month, chess_username)
                ]
            else:
                # fetch all archives
                archives = await chess_com.get_archives(chess_username)
                game_lists = []
                for archive_url in archives:
                    parts = archive_url.rstrip("/").split("/")
                    y, m = int(parts[-2]), int(parts[-1])
                    games = await chess_com.get_games_for_month(y, m, chess_username)
                    game_lists.append(games)

            # 3. Parse and store each game
            total_stored = 0
            for games in game_lists:
                for game_data in games:
                    parsed = pgn_parser.parse_game(game_data, chess_username)
                    if parsed is None:
                        continue

                    # pg_insert with on_conflict_do_nothing = safe deduplication
                    stmt = pg_insert(Game).values(
                        user_id=user_id,
                        **parsed
                    ).on_conflict_do_nothing(index_elements=["chess_com_uuid"])

                    await db.execute(stmt)
                    total_stored += 1

                await db.commit()  # commit after each month

            # 4. Mark job done
            job_result = await db.execute(
                select(IngestionJob).where(IngestionJob.id == job_id)
            )
            job = job_result.scalar_one()
            job.status = "done"
            job.games_fetched = total_stored
            job.completed_at = datetime.now(timezone.utc)
            await db.commit()

        except Exception as e:
            # Mark job as failed — never leave it stuck at "running"
            job_result = await db.execute(
                select(IngestionJob).where(IngestionJob.id == job_id)
            )
            job = job_result.scalar_one()
            job.status = "failed"
            job.completed_at = datetime.now(timezone.utc)
            await db.commit()
            raise


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@router.post("/ingest", response_model=IngestResponse, status_code=202)
async def ingest_games(
    payload: IngestRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.chess_username:
        raise HTTPException(
            status_code=400,
            detail="No chess.com username linked. Call PATCH /auth/me/chess-username first."
        )

    # Create the job record
    job = IngestionJob(
        user_id=current_user.id,
        status="pending",
        year=payload.year,
        month=payload.month,
    )
    db.add(job)
    await db.flush()
    await db.refresh(job)
    job_id = job.id

    # Schedule background task — runs AFTER response is sent
    background_tasks.add_task(
        run_ingestion,
        job_id=job_id,
        user_id=current_user.id,
        chess_username=current_user.chess_username,
        year=payload.year,
        month=payload.month,
    )

    return IngestResponse(
        job_id=job_id,
        status="pending",
        message=f"Ingestion started. Poll GET /games/jobs/{job_id} for status."
    )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(IngestionJob).where(
            IngestionJob.id == job_id,
            IngestionJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/", response_model=list[GameResponse])
async def list_games(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0,
):
    result = await db.execute(
        select(Game)
        .where(Game.user_id == current_user.id)
        .order_by(Game.played_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()