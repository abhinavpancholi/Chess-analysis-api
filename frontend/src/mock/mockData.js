function points(timeControl, startRating, count) {
  let rating = startRating
  const out = []
  const base = Date.now() - count * 3600_000
  for (let i = 0; i < count; i++) {
    const change = Math.round((Math.random() - 0.45) * 12)
    rating += change
    out.push({
      played_at: new Date(base + i * 3600_000).toISOString(),
      rating,
      time_control: timeControl,
      prev_rating: rating - change,
      rating_change: change,
      rolling_avg: rating,
    })
  }
  return out
}

export const mockRatingsResponse = {
  period_days: 30,
  summary: [
    { time_control: 'bullet', start_rating: 1460, end_rating: 1487, elo_change: 27, games_played: 12 },
    { time_control: 'blitz', start_rating: 1610, end_rating: 1602, elo_change: -8, games_played: 40 },
    { time_control: 'rapid', start_rating: 1670, end_rating: 1711, elo_change: 41, games_played: 9 },
  ],
  points: [
    ...points('bullet', 1460, 12),
    ...points('blitz', 1610, 40),
    ...points('rapid', 1670, 9),
  ],
}

export const mockGames = [
  { id: 1, chess_com_uuid: 'mock1', time_control: '180', result: 'win', color_played: 'white', opponent_username: 'kasparov_fan_92', opponent_rating: 1590, user_rating_before: 1594, opening_name: 'Ruy Lopez Morphy Defense', opening_eco: 'C78', played_at: '2026-06-30T18:04:00Z', num_moves: 41, accuracy: 88.2 },
  { id: 2, chess_com_uuid: 'mock2', time_control: '600', result: 'loss', color_played: 'black', opponent_username: 'endgame_wizard', opponent_rating: 1722, user_rating_before: 1722, opening_name: 'Sicilian Defense Najdorf Variation', opening_eco: 'B90', played_at: '2026-06-29T14:22:00Z', num_moves: 55, accuracy: null },
  { id: 3, chess_com_uuid: 'mock3', time_control: '180', result: 'draw', color_played: 'white', opponent_username: 'petrov_defender', opponent_rating: 1600, user_rating_before: 1598, opening_name: "Queens Gambit Declined", opening_eco: 'D30', played_at: '2026-06-29T09:10:00Z', num_moves: 60, accuracy: null },
  { id: 4, chess_com_uuid: 'mock4', time_control: '60', result: 'win', color_played: 'black', opponent_username: 'night_rider88', opponent_rating: 1470, user_rating_before: 1481, opening_name: 'Caro-Kann Defense', opening_eco: 'B12', played_at: '2026-06-28T20:45:00Z', num_moves: 33, accuracy: null },
]