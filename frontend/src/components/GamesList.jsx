import { useState, useEffect } from 'react'
import GameRow, { GAME_ROW_GRID } from './GameRow.jsx'

const PAGE_SIZE = 30
const HEADER_COLS = ['Result', 'Opponent', 'Opening', 'Format', 'Date', 'Rating (Δ)']

export default function GamesList({ games, loading }) {
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0) // jump back to page 1 whenever the underlying set changes (new sync, switching views)
  }, [games])

  const totalPages = games ? Math.max(1, Math.ceil(games.length / PAGE_SIZE)) : 1
  const pageGames = games ? games.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : []

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)' }}>Recent games</h2>
        <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>
          {games?.length ?? 0} total
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
            gridTemplateColumns: GAME_ROW_GRID,
            columnGap: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--ink-faint)',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          {HEADER_COLS.map((c) => (
            <span key={c} style={{ textAlign: c === 'Rating (Δ)' ? 'right' : 'left', whiteSpace: 'nowrap' }}>
              {c}
            </span>
          ))}
        </div>

        {loading && <div style={{ padding: 'var(--space-5)', color: 'var(--ink-muted)' }}>Loading games…</div>}

        {!loading && (!games || games.length === 0) && (
          <div style={{ padding: 'var(--space-5)', color: 'var(--ink-muted)' }}>
            No games yet — sync a month from chess.com to get started.
          </div>
        )}

        {!loading && pageGames.map((g, i) => <GameRow key={g.id} game={g} tinted={i % 2 === 1} />)}
      </div>

      {!loading && games && games.length > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={pagerButtonStyle}>
            ← Prev
          </button>
          <span className="mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={pagerButtonStyle}>
            Next →
          </button>
        </div>
      )}
    </section>
  )
}

const pagerButtonStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  padding: 'var(--space-2) var(--space-3)',
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  cursor: 'pointer',
  opacity: 1,
}