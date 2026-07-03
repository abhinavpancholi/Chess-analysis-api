import Dashboard from './pages/Dashboard.jsx'

function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--brass)' }} aria-hidden="true">
          ♞
        </span>
        <h1 style={{ fontSize: 'var(--text-xl)' }}>Chess Analysis</h1>
      </div>
      <span className="mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
        your_username
      </span>
    </header>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <Dashboard />
    </div>
  )
}
