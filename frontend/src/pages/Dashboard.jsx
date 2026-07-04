import { useEffect, useState, useCallback } from 'react'
import RatingRail from '../components/RatingRail.jsx'
import GamesList from '../components/GamesList.jsx'
import SyncPanel from '../components/SyncPanel.jsx'
import { getRatings, getGames, getGamesForMonth } from '../api/client.js'
import { transformRecentRatings, transformGames, transformMonthRatings, liveRatingsFromResponse } from '../utils/transform.js'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Dashboard() {
  const [ratings, setRatings] = useState(null)
  const [games, setGames] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewingMonth, setViewingMonth] = useState(null)

  const loadRecent = useCallback(() => {
    setLoading(true)
    return Promise.all([getRatings({ days: 30 }), getGames({ limit: 20 })]).then(([ratingsResponse, gamesResponse]) => {
      const liveRatingByControl = liveRatingsFromResponse(ratingsResponse)
      setRatings(transformRecentRatings(ratingsResponse))
      setGames(transformGames(gamesResponse, { liveRatingByControl }))
      setViewingMonth(null)
      setLoading(false)
    })
  }, [])

  const loadMonth = useCallback((year, month) => {
    setLoading(true)
    return Promise.all([getRatings({ days: 30 }), getGamesForMonth({ year, month })]).then(
      ([ratingsResponse, { games: monthRawGames, boundaryByControl }]) => {
        const liveRatingByControl = liveRatingsFromResponse(ratingsResponse)
        const transformedMonthGames = transformGames(monthRawGames, { liveRatingByControl, boundaryByControl })
        setRatings(transformMonthRatings(transformedMonthGames, liveRatingByControl))
        setGames(transformedMonthGames)
        setViewingMonth({ year, month })
        setLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    let cancelled = false
    loadRecent().then(() => {
      if (cancelled) return
    })
    return () => {
      cancelled = true
    }
  }, [loadRecent])

  function handleSyncComplete(job) {
    // job is the polled GET /games/jobs/{id} result once status === 'done' — includes year/month
    loadMonth(job.year, job.month)
  }

  return (
    <main>
      <SyncPanel onSyncComplete={handleSyncComplete} />

      {viewingMonth && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--surface-tint)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-muted)',
          }}
        >
          <span>
            Showing games from{' '}
            <strong style={{ color: 'var(--ink)' }}>
              {MONTH_NAMES[viewingMonth.month - 1]} {viewingMonth.year}
            </strong>
          </span>
          <button
            onClick={loadRecent}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brass-strong)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: 'var(--text-sm)',
            }}
          >
            Back to recent
          </button>
        </div>
      )}

      <RatingRail ratings={ratings} loading={loading} />
      <GamesList games={games} loading={loading} />
    </main>
  )
}