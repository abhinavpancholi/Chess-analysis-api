import chess.pgn
import io
from datetime import datetime, timezone
from typing import Optional

WIN_RESULTS = {"win"}
DRAW_RESULTS = {
    "agreed", "repetition", "stalemate", "insufficient",
    "50move", "timevsinsufficient", "DrawAccepted"
}


def parse_game(game_data: dict, chess_username: str) -> Optional[dict]:
    """
    Takes one raw game dict from chess.com API.
    Returns a clean dict ready to insert into the games table.
    Returns None if the game cannot be parsed.
    """
    try:
        pgn_string = game_data.get("pgn", "")
        if not pgn_string:
            return None

        pgn_io = io.StringIO(pgn_string)
        game = chess.pgn.read_game(pgn_io)
        if game is None:
            return None

        headers = game.headers

        # --- UUID for deduplication ---
        url = game_data.get("url", "")
        chess_com_uuid = url.split("/")[-1]
        if not chess_com_uuid:
            return None

        # --- Figure out which color you played ---
        white_username = game_data["white"]["username"].lower()
        is_white = white_username == chess_username.lower()

        if is_white:
            color         = "white"
            user_rating   = game_data["white"].get("rating")
            opp_username  = game_data["black"]["username"]
            opp_rating    = game_data["black"].get("rating")
            raw_result    = game_data["white"].get("result", "")
        else:
            color         = "black"
            user_rating   = game_data["black"].get("rating")
            opp_username  = game_data["white"]["username"]
            opp_rating    = game_data["white"].get("rating")
            raw_result    = game_data["black"].get("result", "")

        # --- Normalise result to win / loss / draw ---
        if raw_result in WIN_RESULTS:
            result = "win"
        elif raw_result in DRAW_RESULTS:
            result = "draw"
        else:
            result = "loss"

        # --- Timestamp ---
        end_time = game_data.get("end_time")
        played_at = (
            datetime.fromtimestamp(end_time, tz=timezone.utc)
            if end_time else None
        )

        # --- Opening ---
        eco_url = headers.get("ECOUrl", "")
        if eco_url and "/openings/" in eco_url:
            opening_name = eco_url.split("/openings/")[-1].replace("-", " ")
        else:
            opening_name = None
        opening_eco = headers.get("ECO") or None

        # --- Move count ---
        num_moves = len(list(game.mainline_moves())) // 2

        # --- Accuracy (not always present) ---
        accuracy = None
        if "accuracies" in game_data:
            key = "white" if is_white else "black"
            accuracy = game_data["accuracies"].get(key)

        return {
            "chess_com_uuid":     chess_com_uuid,
            "pgn":                pgn_string,
            "time_control":       game_data.get("time_control"),
            "result":             result,
            "color_played":       color,
            "opponent_username":  opp_username,
            "opponent_rating":    opp_rating,
            "user_rating_before": user_rating,
            "opening_name":       opening_name,
            "opening_eco":        opening_eco,
            "played_at":          played_at,
            "num_moves":          num_moves,
            "accuracy":           accuracy,
        }

    except Exception:
        # One bad game never crashes the whole sync
        return None