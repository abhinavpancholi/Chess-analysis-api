from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

def classify_time_control(time_control: str) -> str:
    if not time_control:
        return "unknown"

    # Daily games use a fraction format like "1/86400"
    if "/" in time_control:
        return "daily"

    # Extract base seconds — ignore increment after "+"
    try:
        base_seconds = int(time_control.split("+")[0])
    except ValueError:
        return "unknown"

    if base_seconds < 180:
        return "bullet"
    elif base_seconds < 600:
        return "blitz"
    elif base_seconds <= 3600:
        return "rapid"
    else:
        return "daily"


async def get_win_rate(db: AsyncSession, user_id: int) -> list[dict]:
    # Fetch raw time_control strings from DB
    sql = text("""
        SELECT
            time_control,
            COUNT(*) FILTER (WHERE result = 'win')  AS wins,
            COUNT(*) FILTER (WHERE result = 'loss') AS losses,
            COUNT(*) FILTER (WHERE result = 'draw') AS draws,
            COUNT(*) AS total
        FROM games
        WHERE user_id = :user_id
          AND time_control IS NOT NULL
        GROUP BY time_control
    """)
    result = await db.execute(sql, {"user_id": user_id})
    rows = result.mappings().all()

    # Aggregate by category in Python
    from collections import defaultdict
    buckets = defaultdict(lambda: {"wins": 0, "losses": 0, "draws": 0, "total": 0})

    for row in rows:
        category = classify_time_control(row["time_control"])
        buckets[category]["wins"]   += row["wins"]
        buckets[category]["losses"] += row["losses"]
        buckets[category]["draws"]  += row["draws"]
        buckets[category]["total"]  += row["total"]

    # Return in a fixed display order
    order = ["bullet", "blitz", "rapid", "daily", "unknown"]
    output = []
    for category in order:
        if category not in buckets:
            continue
        b = buckets[category]
        total = b["total"]
        output.append({
            "time_control": category,
            "wins":         b["wins"],
            "losses":       b["losses"],
            "draws":        b["draws"],
            "total":        total,
            "win_rate":     round(b["wins"] / total * 100, 1) if total > 0 else 0.0,
        })
    return output


async def get_openings(db: AsyncSession, user_id: int) -> list[dict]:
    sql = text("""
        SELECT
            opening_name,
            opening_eco,
            COUNT(*) AS games_played,
            COUNT(*) FILTER (WHERE result = 'win')  AS wins,
            COUNT(*) FILTER (WHERE result = 'loss') AS losses,
            COUNT(*) FILTER (WHERE result = 'draw') AS draws
        FROM games
        WHERE user_id   = :user_id
          AND opening_name IS NOT NULL
        GROUP BY opening_name, opening_eco
        HAVING COUNT(*) >= 3
        ORDER BY games_played DESC
        LIMIT 20
    """)
    result = await db.execute(sql, {"user_id": user_id})
    rows = result.mappings().all()

    output = []
    for row in rows:
        played = row["games_played"]
        wins   = row["wins"]
        output.append({
            "opening_name": row["opening_name"],
            "opening_eco":  row["opening_eco"],
            "games_played": played,
            "wins":         wins,
            "losses":       row["losses"],
            "draws":        row["draws"],
            "win_rate":     round(wins / played * 100, 1) if played > 0 else 0.0,
        })
    return output


async def get_rating_trend(db: AsyncSession, user_id: int, days: int = 30) -> dict:
    if days not in (30, 60, 90):
        days = 30

    sql = text(f"""
        SELECT
            played_at,
            time_control,
            user_rating_before,
            LAG(user_rating_before) OVER (ORDER BY played_at) AS prev_rating,
            AVG(user_rating_before) OVER (
                ORDER BY played_at
                ROWS BETWEEN 9 PRECEDING AND CURRENT ROW
            ) AS rolling_avg
        FROM games
        WHERE user_id            = :user_id
          AND played_at          >= NOW() - INTERVAL '{days} days'
          AND user_rating_before IS NOT NULL
        ORDER BY played_at
    """)
    result = await db.execute(sql, {"user_id": user_id})
    rows = result.mappings().all()

    if not rows:
        return {
            "summary":  [],
            "points":   [],
            "period_days": days,
        }

    # --- Build per-category summary ---
    # Group rows by time control category
    from collections import defaultdict
    category_rows = defaultdict(list)
    for row in rows:
        category = classify_time_control(row["time_control"] or "")
        if category == "unknown":
            continue
        category_rows[category].append(row)

    # For each category: first game rating vs last game rating
    order = ["bullet", "blitz", "rapid", "daily"]
    summary = []
    for category in order:
        cat_rows = category_rows.get(category)
        if not cat_rows:
            continue
        start_rating = cat_rows[0]["user_rating_before"]
        end_rating   = cat_rows[-1]["user_rating_before"]
        elo_change   = end_rating - start_rating
        summary.append({
            "time_control": category,
            "start_rating": start_rating,
            "end_rating":   end_rating,
            "elo_change":   elo_change,
            "games_played": len(cat_rows),
        })

    # --- Build per-game points (all categories combined, for chart) ---
    points = []
    for row in rows:
        prev = row["prev_rating"]
        curr = row["user_rating_before"]
        points.append({
            "played_at":     row["played_at"],
            "rating":        curr,
            "time_control":  classify_time_control(row["time_control"] or ""),
            "prev_rating":   prev,
            "rating_change": (curr - prev) if prev is not None else None,
            "rolling_avg":   round(float(row["rolling_avg"]), 1),
        })

    return {
        "period_days": days,
        "summary":     summary,
        "points":      points,
    }


async def get_by_color(db: AsyncSession, user_id: int) -> list[dict]:
    sql = text("""
        SELECT
            color_played,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE result = 'win') AS wins,
            COUNT(*) FILTER (WHERE result = 'loss') AS losses,
            COUNT(*) FILTER (WHERE result = 'draw') AS draws,
            ROUND(
                AVG(accuracy) FILTER (WHERE accuracy IS NOT NULL)::numeric,
            1) AS avg_accuracy
        FROM games
        WHERE user_id      = :user_id
          AND color_played IS NOT NULL
        GROUP BY color_played
        ORDER BY color_played
    """)
    result = await db.execute(sql, {"user_id": user_id})
    rows = result.mappings().all()

    output = []
    for row in rows:
        total = row["total"]
        wins  = row["wins"]
        acc   = row["avg_accuracy"]
        output.append({
            "color":        row["color_played"],
            "total":        total,
            "wins":         wins,
            "losses":       row["losses"],
            "draws":        row["draws"],
            "win_rate":     round(wins / total * 100, 1) if total > 0 else 0.0,
            "avg_accuracy": float(acc) if acc is not None else None,
        })
    return output


async def get_best_openings(db: AsyncSession, user_id: int) -> dict:
    sql = text("""
        SELECT
            opening_name,
            opening_eco,
            COUNT(*) AS games_played,
            COUNT(*) FILTER (WHERE result = 'win') AS wins,
            ROUND(
                COUNT(*) FILTER (WHERE result = 'win') * 100.0 / COUNT(*),
            1) AS win_rate
        FROM games
        WHERE user_id      = :user_id
          AND opening_name IS NOT NULL
        GROUP BY opening_name, opening_eco
        HAVING COUNT(*) >= 5
        ORDER BY win_rate DESC
    """)
    result = await db.execute(sql, {"user_id": user_id})
    rows = result.mappings().all()

    def to_item(row):
        return {
            "opening_name": row["opening_name"],
            "eco":          row["opening_eco"],
            "games_played": row["games_played"],
            "win_rate":     float(row["win_rate"]),
        }

    all_rows = list(rows)
    return {
        "best":  [to_item(r) for r in all_rows[:10]],
        "worst": [to_item(r) for r in reversed(all_rows[-10:])],
    }


async def get_activity(
    db: AsyncSession, user_id: int, granularity: str = "day"
) -> list[dict]:
    if granularity not in ("day", "week"):
        granularity = "day"

    sql = text(f"""
        SELECT
            DATE_TRUNC('{granularity}', played_at) AS period,
            COUNT(*) AS games_played,
            COUNT(*) FILTER (WHERE result = 'win') AS wins,
            COUNT(*) FILTER (WHERE result = 'loss') AS losses,
            COUNT(*) FILTER (WHERE result = 'draw') AS draws
        FROM games
        WHERE user_id  = :user_id
          AND played_at >= NOW() - INTERVAL '30 days'
          AND played_at IS NOT NULL
        GROUP BY DATE_TRUNC('{granularity}', played_at)
        ORDER BY period
    """)
    result = await db.execute(sql, {"user_id": user_id})
    rows = result.mappings().all()

    # Zero-fill missing days so chart has no gaps
    filled = []
    if rows:
        start = rows[0]["period"].date()
        end   = datetime.now(timezone.utc).date()
        row_map = {r["period"].date(): r for r in rows}

        current = start
        while current <= end:
            if current in row_map:
                r = row_map[current]
                filled.append({
                    "period":       current.isoformat(),
                    "games_played": r["games_played"],
                    "wins":         r["wins"],
                    "losses":       r["losses"],
                    "draws":        r["draws"],
                })
            else:
                filled.append({
                    "period":       current.isoformat(),
                    "games_played": 0,
                    "wins":         0,
                    "losses":       0,
                    "draws":        0,
                })
            step = timedelta(weeks=1) if granularity == "week" else timedelta(days=1)
            current += step

    return filled