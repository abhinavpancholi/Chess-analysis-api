import httpx
from app.config import settings

HEADERS = {
    "User-Agent": "ChessAnalysisAPI/1.0 abhnv2002@gmail.com"
}


async def get_archives(chess_username: str) -> list[str]:
    """ for the reference
    Returns list of archive URLs for a player.
    Each URL = one month of games.
    e.g. ["https://api.chess.com/pub/player/hikaru/games/2024/01", ...]
    """
    url = f"{settings.CHESS_COM_BASE_URL}/player/{chess_username}/games/archives"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("archives", [])


async def get_games_for_month(year: int, month: int, chess_username: str) -> list[dict]:
    """
    Returns raw list of game dicts for a specific month.
    """
    url = f"{settings.CHESS_COM_BASE_URL}/player/{chess_username}/games/{year}/{month:02d}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS, timeout=30)
        if response.status_code == 404:
            return []
        response.raise_for_status()
        data = response.json()
        return data.get("games", [])