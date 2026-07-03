import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { cardStyle, labelStyle, inputStyle, buttonStyle, errorStyle, linkStyle } from './authStyles.js'

export default function Login({ onSwitchToRegister }) {
  const { login, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    await login({ email, password })
    setSubmitting(false)
  }

  return (
    <div style={cardStyle}>
      <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Sign in</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={labelStyle}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} autoComplete="email" />
        </label>

        <label style={labelStyle}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} autoComplete="current-password" />
        </label>

        {error && <p style={errorStyle}>{error}</p>}

        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} style={linkStyle}>
          Create one
        </button>
      </p>
    </div>
  )
}