// Fallback data shown when the API is unreachable (e.g. local dev without
// the backend running). Shapes mirror what /analytics/rating-trend and
// /games/ are expected to return.

function sparkline(base, points = 12) {
  let v = base
  const out = []
  for (let i = 0; i < points; i++) {
    v += Math.round((Math.random() - 0.45) * 12)
    out.push({ i, rating: v })
  }
  return out
}

export const mockRatings = [
  { timeControl: 'bullet', label: 'Bullet', current: 1487, delta: 23, history: sparkline(1460) },
  { timeControl: 'blitz', label: 'Blitz', current: 1602, delta: -8, history: sparkline(1610) },
  { timeControl: 'rapid', label: 'Rapid', current: 1711, delta: 34, history: sparkline(1670) },
  { timeControl: 'daily', label: 'Daily', current: 1580, delta: 0, history: sparkline(1580) },
]

export const mockGames = [
  { id: 1, opponent: 'kasparov_fan_92', color: 'white', result: 'win', timeControl: 'blitz', opening: "Ruy Lopez", date: '2026-06-30', ratingChange: 8 },
  { id: 2, opponent: 'endgame_wizard', color: 'black', result: 'loss', timeControl: 'rapid', opening: "Sicilian Defense", date: '2026-06-29', ratingChange: -11 },
  { id: 3, opponent: 'petrov_defender', color: 'white', result: 'draw', timeControl: 'blitz', opening: "Queen's Gambit Declined", date: '2026-06-29', ratingChange: 2 },
  { id: 4, opponent: 'night_rider88', color: 'black', result: 'win', timeControl: 'bullet', opening: "Caro-Kann Defense", date: '2026-06-28', ratingChange: 6 },
  { id: 5, opponent: 'rook_lift_pro', color: 'white', result: 'win', timeControl: 'rapid', opening: "Italian Game", date: '2026-06-27', ratingChange: 12 },
  { id: 6, opponent: 'zugzwang_zoe', color: 'black', result: 'loss', timeControl: 'blitz', opening: "French Defense", date: '2026-06-26', ratingChange: -9 },
  { id: 7, opponent: 'castled_early', color: 'white', result: 'win', timeControl: 'daily', opening: "London System", date: '2026-06-24', ratingChange: 5 },
]
