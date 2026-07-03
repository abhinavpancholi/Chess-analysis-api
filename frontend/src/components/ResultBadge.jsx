const CONFIG = {
  win: { fill: 'var(--brass)', stroke: 'var(--brass)', label: 'Win' },
  draw: { fill: 'none', stroke: 'var(--slate-draw)', label: 'Draw' },
  loss: { fill: 'none', stroke: 'var(--oxblood)', label: 'Loss' },
}

// A small filled/hollow disc, evoking a captured piece on a scoresheet
// rather than a generic colored pill.
export default function ResultBadge({ result }) {
  const cfg = CONFIG[result] ?? CONFIG.draw
  return (
    <span
      role="img"
      aria-label={cfg.label}
      title={cfg.label}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle
          cx="7"
          cy="7"
          r="5.5"
          fill={cfg.fill}
          stroke={cfg.stroke}
          strokeWidth={result === 'win' ? 0 : 1.75}
        />
        {result === 'draw' && <line x1="3.2" y1="7" x2="10.8" y2="7" stroke="var(--slate-draw)" strokeWidth="1.5" />}
      </svg>
      <span
        className="mono"
        style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
      >
        {cfg.label}
      </span>
    </span>
  )
}
