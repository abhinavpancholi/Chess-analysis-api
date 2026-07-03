import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Header({ email, onLogout }) {
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

      {email && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className="mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
            {email}
          </span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-1) var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}

function AppContent() {
  const { user, loading, logout } = useAuth()
  const [authView, setAuthView] = useState('login')

  if (loading) {
    return (
      <div className="app-shell">
        <p className="mono" style={{ color: 'var(--ink-muted)' }}>
          Loading…
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-shell">
        <Header />
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header email={user.email} onLogout={logout} />
      <Dashboard />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}