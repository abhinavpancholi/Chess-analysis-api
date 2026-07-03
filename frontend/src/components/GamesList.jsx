import GameRow from './GameRow.jsx'

const HEADER_COLS = ['Result', 'Opponent', 'Opening', 'Format', 'Date', 'Δ']

export default function GamesList({ games, loading }) {
  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-3)',
        }}
      >
        <h2 style={{ fontSize: 'var(--text-lg)' }}>Recent games</h2>
        <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>
          {games?.length ?? 0} shown
        </span>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        <div
          className="mono"
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 1fr auto auto auto',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--ink-faint)',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          {HEADER_COLS.map((c) => (
            <span key={c} style={{ textAlign: c === 'Δ' ? 'right' : 'left' }}>
              {c}
            </span>
          ))}
        </div>

        {loading && (
          <div style={{ padding: 'var(--space-5)', color: 'var(--ink-muted)' }}>Loading games…</div>
        )}

        {!loading && (!games || games.length === 0) && (
          <div style={{ padding: 'var(--space-5)', color: 'var(--ink-muted)' }}>
            No games yet — sync a month from chess.com to get started.
          </div>
        )}

        {!loading &&
          games?.map((g, i) => <GameRow key={g.id} game={g} tinted={i % 2 === 1} />)}
      </div>
    </section>
  )
}
