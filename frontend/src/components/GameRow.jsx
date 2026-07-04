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
        flexShrink: 0,
      }}
    />
  )
}

export const GAME_ROW_GRID = '90px 1.4fr 1fr 80px 90px 150px'

export default function GameRow({ game, tinted }) {
  const known = game.ratingChange !== null && game.ratingChange !== undefined
  const positive = known && game.ratingChange > 0
  const flat = known && game.ratingChange === 0

  let deltaLabel = '—'
  if (known) {
    const sign = flat ? '±0' : positive ? `+${game.ratingChange}` : game.ratingChange
    deltaLabel = `${game.ratingAfter} (${sign})`
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: GAME_ROW_GRID,
        alignItems: 'center',
        columnGap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        background: tinted ? 'var(--surface-tint)' : 'transparent',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <ResultBadge result={game.result} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
        <ColorChip color={game.color} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {game.opponent}
          {game.opponentRating != null && (
            <span className="mono" style={{ color: 'var(--ink-faint)', fontSize: 'var(--text-sm)' }}>
              {' '}({game.opponentRating})
            </span>
          )}
        </span>
      </div>

      <span
        title={game.openingFull}
        style={{ color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {game.opening}
      </span>

      <span
        className="mono"
        style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}
      >
        {game.timeControl}
      </span>

      <span className="mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
        {game.date}
      </span>

      <span
        className="mono"
        style={{
          fontSize: 'var(--text-sm)',
          textAlign: 'right',
          whiteSpace: 'nowrap',
          color: !known ? 'var(--ink-faint)' : flat ? 'var(--ink-faint)' : positive ? 'var(--brass-strong)' : 'var(--oxblood)',
        }}
      >
        {deltaLabel}
      </span>
    </div>
  )
}