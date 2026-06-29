from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    WinRateStat, OpeningStat, RatingTrendResponse,
    ColorStat, BestOpeningsResponse, ActivityPoint,
)
from app.services import analytics as analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/win-rate", response_model=list[WinRateStat])
async def win_rate(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_win_rate(db, current_user.id)


@router.get("/openings", response_model=list[OpeningStat])
async def openings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_openings(db, current_user.id)


@router.get("/rating-trend", response_model=RatingTrendResponse)
async def rating_trend(
    days: int = Query(default=30, description="30, 60, or 90"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_rating_trend(db, current_user.id, days)


@router.get("/by-color", response_model=list[ColorStat])
async def by_color(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_by_color(db, current_user.id)


@router.get("/best-openings", response_model=BestOpeningsResponse)
async def best_openings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_best_openings(db, current_user.id)


@router.get("/activity", response_model=list[ActivityPoint])
async def activity(
    granularity: str = Query(default="day", description="day or week"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_activity(db, current_user.id, granularity)