import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { cardStyle, labelStyle, inputStyle, buttonStyle, errorStyle, linkStyle } from './authStyles.js'

export default function Register({ onSwitchToLogin }) {
  const { register, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [chessUsername, setChessUsername] = useState('')
  const [localError, setLocalError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)

    if (password !== confirm) {
      setLocalError("Passwords don't match")
      return
    }

    setSubmitting(true)
    await register({ email, password, chess_username: chessUsername.trim() || undefined })
    setSubmitting(false)
  }

  return (
    <div style={cardStyle}>
      <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Create your account</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={labelStyle}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} autoComplete="email" />
        </label>

        <label style={labelStyle}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} style={inputStyle} autoComplete="new-password" />
        </label>

        <label style={labelStyle}>
          Confirm password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={inputStyle} autoComplete="new-password" />
        </label>

        <label style={labelStyle}>
          Chess.com username <span style={{ color: 'var(--ink-faint)' }}>(optional — add later if you skip this)</span>
          <input
            type="text"
            value={chessUsername}
            onChange={(e) => setChessUsername(e.target.value)}
            style={inputStyle}
            placeholder="e.g. hikaru"
            autoComplete="off"
          />
        </label>

        {(localError || error) && <p style={errorStyle}>{localError || error}</p>}

        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} style={linkStyle}>
          Sign in
        </button>
      </p>
    </div>
  )
}