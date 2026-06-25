from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    chess_com_uuid: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    pgn: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    time_control: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    result: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    color_played: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    opponent_username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    opponent_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    user_rating_before: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    user_rating_after: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    opening_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    opening_eco: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    played_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    num_moves: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    accuracy: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    user: Mapped["User"] = relationship("User", backref="games")  # type: ignore


class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(20), default="pending")
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    month: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    games_fetched: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )