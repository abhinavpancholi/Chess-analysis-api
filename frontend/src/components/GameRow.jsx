import ResultBadge from './ResultBadge.jsx'

function ColorChip({ color }) {
  const isWhite = color === 'white'
  return (
    <span
      aria-label={isWhite ? 'Played as White' : 'Played as Black'}
      title={isWhite ? 'White' : 'Black'}
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: 2,
        background: isWhite ? 'var(--surface)' : 'var(--board-dark)',
        border: '1px solid var(--hairline)',
      }}
    />
  )
}

export default function GameRow({ game, tinted }) {
  const positive = game.ratingChange > 0
  const flat = game.ratingChange === 0

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr 1fr auto auto auto',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-3)',
        background: tinted ? 'var(--surface-tint)' : 'transparent',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <ResultBadge result={game.result} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
        <ColorChip color={game.color} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.opponent}</span>
      </div>

      <span style={{ color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {game.opening}
      </span>

      <span
        className="mono"
        style={{
          fontSize: 'var(--text-xs)',
          textTransform: 'uppercase',
          color: 'var(--ink-muted)',
        }}
      >
        {game.timeControl}
      </span>

      <span className="mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
        {game.date}
      </span>

      <span
        className="mono"
        style={{
          fontSize: 'var(--text-sm)',
          textAlign: 'right',
          color: flat ? 'var(--ink-faint)' : positive ? 'var(--brass-strong)' : 'var(--oxblood)',
        }}
      >
        {flat ? '±0' : positive ? `+${game.ratingChange}` : game.ratingChange}
      </span>
    </div>
  )
}
