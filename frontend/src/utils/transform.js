export function bucketTimeControl(rawSeconds) {
  if (typeof rawSeconds === 'string' && rawSeconds.includes('/')) return 'daily'
  const seconds = parseInt(rawSeconds, 10)
  if (Number.isNaN(seconds)) return rawSeconds
  if (seconds < 180) return 'bullet'
  if (seconds < 600) return 'blitz'
  return 'rapid'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Opening names have the move list appended after a " <digit>" token —
// cut there.
function shortenOpening(name) {
  if (!name) return 'Unknown opening'
  const moveListStart = name.search(/\s\d/)
  return moveListStart > 0 ? name.slice(0, moveListStart) : name
}

export function truncate(str, maxLen) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen).trimEnd() + '...' : str
}

/** Recent-view rating cards, straight from /analytics/rating-trend's own summary + points. */
export function transformRecentRatings(data) {
  if (!data || !Array.isArray(data.summary)) return []

  return data.summary.map((s) => {
    const history = (data.points || [])
      .filter((p) => p.time_control === s.time_control)
      .map((p, i) => ({ i, rating: p.rating }))

    return {
      timeControl: s.time_control,
      label: s.time_control.charAt(0).toUpperCase() + s.time_control.slice(1),
      current: s.end_rating,
      delta: s.elo_change,
      history: history.length ? history : [{ i: 0, rating: s.end_rating }],
    }
  })
}

/** Bucketed time control -> current live rating, from any rating-trend response. */
export function liveRatingsFromResponse(data) {
  const map = new Map()
  for (const s of data?.summary || []) map.set(s.time_control, s.end_rating)
  return map
}

/**
 * Annotates a newest-first games array with a computed rating change/after
 * per game, using each game's own `user_rating_before` chained against the
 * next more-recent game of the same time control. Deliberately doesn't
 * touch /analytics/rating-trend for this — that endpoint's window doesn't
 * reliably reach back far enough for older synced months.
 *
 * - `liveRatingByControl`: used as the "next" reference for the most
 *   recent game of a control when there's no newer game in the list at
 *   all (the normal case for the unbounded recent-games view).
 * - `boundaryByControl`: used for month views — the closest real game
 *   just OUTSIDE the fetched month, on the newer side.
 */
export function transformGames(games, { liveRatingByControl = new Map(), boundaryByControl = new Map() } = {}) {
  const nextRatingByControl = new Map(liveRatingByControl)
  for (const [control, game] of boundaryByControl) nextRatingByControl.set(control, game.user_rating_before)

  return (games || []).map((g) => {
    const control = bucketTimeControl(g.time_control)
    const ratingAfter = nextRatingByControl.has(control) ? nextRatingByControl.get(control) : null
    const ratingChange = ratingAfter != null ? ratingAfter - g.user_rating_before : null
    nextRatingByControl.set(control, g.user_rating_before) // becomes the "next" reference for the older game after this one

    const fullOpening = shortenOpening(g.opening_name)
    return {
      id: g.id,
      opponent: g.opponent_username,
      opponentRating: g.opponent_rating,
      color: g.color_played,
      result: g.result,
      timeControl: control,
      opening: truncate(fullOpening, 25),
      openingFull: fullOpening,
      date: formatDate(g.played_at),
      playedAt: g.played_at,
      userRatingBefore: g.user_rating_before,
      ratingChange,
      ratingAfter,
    }
  })
}

/**
 * RatingCard data for a specific synced month: current = today's real
 * rating, start = the earliest month-game's user_rating_before for that
 * control, so the delta reads "since that month" rather than a fixed
 * recent-days window.
 */
export function transformMonthRatings(transformedMonthGames, liveRatingByControl) {
  const gamesByControl = new Map()
  for (const g of transformedMonthGames) {
    if (!gamesByControl.has(g.timeControl)) gamesByControl.set(g.timeControl, [])
    gamesByControl.get(g.timeControl).push(g)
  }

  const allControls = new Set([...gamesByControl.keys(), ...liveRatingByControl.keys()])
  const cards = []

  for (const control of allControls) {
    const gamesForControl = gamesByControl.get(control)
    const current = liveRatingByControl.get(control)

    if (!gamesForControl || gamesForControl.length === 0) {
      // No games this month for this control — nothing to compute a delta from.
      cards.push({
        timeControl: control,
        label: control.charAt(0).toUpperCase() + control.slice(1),
        current: current ?? null,
        delta: null, // null = "no games this month", distinct from a real 0 (played but no net change)
        history: current != null ? [{ i: 0, rating: current }] : [],
      })
      continue
    }

    const chronological = [...gamesForControl].sort((a, b) => new Date(a.playedAt) - new Date(b.playedAt))
    const startRating = chronological[0].userRatingBefore
    const resolvedCurrent = current ?? chronological.at(-1).ratingAfter ?? startRating

    cards.push({
      timeControl: control,
      label: control.charAt(0).toUpperCase() + control.slice(1),
      current: resolvedCurrent,
      delta: resolvedCurrent - startRating,
      history: chronological.map((g, i) => ({ i, rating: g.ratingAfter ?? g.userRatingBefore })),
    })
  }

  return cards.sort((a, b) => a.label.localeCompare(b.label))
}