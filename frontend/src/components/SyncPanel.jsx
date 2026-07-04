import { useState } from 'react'
import { useSyncJob } from '../hooks/useSyncJob.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const now = new Date()

export default function SyncPanel({ onSyncComplete }) {
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-indexed, matches API
  const { job, error, startSync, isSyncing } = useSyncJob({ onComplete: onSyncComplete })

  function handleSubmit(e) {
    e.preventDefault()
    startSync({ year, month })
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
      }}
    >
      <span className="mono" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>
        Sync from chess.com
      </span>

      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          disabled={isSyncing}
          style={selectStyle}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          disabled={isSyncing}
          style={{ ...selectStyle, width: 80 }}
          min={2007}
          max={now.getFullYear()}
        />

        <button type="submit" disabled={isSyncing} style={buttonStyle}>
          {isSyncing ? 'Syncing…' : 'Sync month'}
        </button>
      </form>

      <StatusLine job={job} error={error} />
    </div>
  )
}

function StatusLine({ job, error }) {
  if (error) {
    return <span style={{ color: 'var(--oxblood)', fontSize: 'var(--text-sm)' }}>{error}</span>
  }
  if (!job) return null

  if (job.status === 'done') {
    return (
      <span className="mono" style={{ color: 'var(--brass-strong)', fontSize: 'var(--text-sm)' }}>
        ✓ {job.games_fetched} game{job.games_fetched === 1 ? '' : 's'} fetched
      </span>
    )
  }
  if (job.status === 'failed' || job.status === 'error') {
    return <span style={{ color: 'var(--oxblood)', fontSize: 'var(--text-sm)' }}>Sync failed — try again</span>
  }
  return (
    <span className="mono" style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>
      {job.status}…
    </span>
  )
}

const selectStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  padding: 'var(--space-2)',
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg)',
  color: 'var(--ink)',
}

const buttonStyle = {
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  padding: 'var(--space-2) var(--space-4)',
  background: 'var(--brass)',
  color: 'var(--surface)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
}