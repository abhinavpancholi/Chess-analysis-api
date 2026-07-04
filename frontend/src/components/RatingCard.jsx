import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function RatingCard({ label, current, delta, history }) {
  const noGamesThisMonth = delta === null || delta === undefined
  const isUp = !noGamesThisMonth && delta > 0
  const isFlat = !noGamesThisMonth && delta === 0
  const deltaColor = noGamesThisMonth ? 'var(--ink-faint)' : isFlat ? 'var(--ink-faint)' : isUp ? 'var(--brass-strong)' : 'var(--oxblood)'
  const sign = isFlat ? '' : isUp ? '+' : ''

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-card)',
        flex: '1 1 200px',
        minWidth: 180,
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 'var(--text-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ink-muted)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <span className="mono" style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink)' }}>
          {current ?? '—'}
        </span>
        {!noGamesThisMonth && (
          <span className="mono" style={{ fontSize: 'var(--text-sm)', color: deltaColor }}>
            {sign}
            {delta}
          </span>
        )}
      </div>

      {noGamesThisMonth ? (
        <div
          style={{
            height: 36,
            marginTop: 'var(--space-2)',
            display: 'flex',
            alignItems: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-faint)',
            fontStyle: 'italic',
          }}
        >
          No games this month
        </div>
      ) : (
        <div style={{ height: 36, marginTop: 'var(--space-2)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <Line
                type="monotone"
                dataKey="rating"
                stroke={isFlat ? 'var(--ink-faint)' : isUp ? 'var(--brass)' : 'var(--oxblood)'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}