import { useEffect, useState } from 'react'
import RatingRail from '../components/RatingRail.jsx'
import GamesList from '../components/GamesList.jsx'
import { getRatings, getGames } from '../api/client.js'

export default function Dashboard() {
  const [ratings, setRatings] = useState(null)
  const [games, setGames] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getRatings(), getGames()]).then(([r, g]) => {
      if (cancelled) return
      setRatings(r)
      setGames(g)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main>
      <RatingRail ratings={ratings} loading={loading} />
      <GamesList games={games} loading={loading} />
    </main>
  )
}
