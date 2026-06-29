from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WinRateStat(BaseModel):
    time_control: str
    wins: int
    losses: int
    draws: int
    total: int
    win_rate: float


class OpeningStat(BaseModel):
    opening_name: str
    opening_eco: Optional[str]
    games_played: int
    wins: int
    losses: int
    draws: int
    win_rate: float


class RatingTrendSummary(BaseModel):
    time_control: str
    start_rating: int
    end_rating: int
    elo_change: int
    games_played: int


class RatingPoint(BaseModel):
    played_at: datetime
    rating: int
    time_control: str
    prev_rating: Optional[int]
    rating_change: Optional[int]
    rolling_avg: float


class RatingTrendResponse(BaseModel):
    period_days: int
    summary: list[RatingTrendSummary]
    points: list[RatingPoint]


class ColorStat(BaseModel):
    color: str
    total: int
    wins: int
    losses: int
    draws: int
    win_rate: float
    avg_accuracy: Optional[float]


class BestOpeningItem(BaseModel):
    opening_name: str
    eco: Optional[str]
    games_played: int
    win_rate: float


class BestOpeningsResponse(BaseModel):
    best: list[BestOpeningItem]
    worst: list[BestOpeningItem]


class ActivityPoint(BaseModel):
    period: str
    games_played: int
    wins: int
    losses: int
    draws: int