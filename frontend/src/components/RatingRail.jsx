import RatingCard from './RatingCard.jsx'

export default function RatingRail({ ratings, loading }) {
  if (loading) {
    return (
      <div className="mono" style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>
        Loading ratings…
      </div>
    )
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div
        style={{
          border: '1px dashed var(--hairline)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          color: 'var(--ink-muted)',
        }}
      >
        No games synced yet. Sync a month from chess.com to see your ratings here.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
      {ratings.map((r) => (
        <RatingCard key={r.timeControl} {...r} />
      ))}
    </div>
  )
}
