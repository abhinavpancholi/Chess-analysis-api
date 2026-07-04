from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class IngestRequest(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None


class IngestResponse(BaseModel):
    job_id: int
    status: str
    message: str


class JobStatusResponse(BaseModel):
    id: int
    status: str
    year: Optional[int]
    month: Optional[int]
    games_fetched: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GameResponse(BaseModel):
    id: int
    chess_com_uuid: str
    time_control: Optional[str]
    result: Optional[str]
    color_played: Optional[str]
    opponent_username: Optional[str]
    opponent_rating: Optional[int]
    user_rating_before: Optional[int]
    opening_name: Optional[str]
    opening_eco: Optional[str]
    played_at: Optional[datetime]
    num_moves: Optional[int]
    accuracy: Optional[float]

    model_config = ConfigDict(from_attributes=True)

class GameDetail(GameResponse):
    pgn: Optional[str] = None