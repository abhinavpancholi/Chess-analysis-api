import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, getMe, getToken, clearToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await getMe()
      setUser(me)
    } catch {
      clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  async function login(credentials) {
    setError(null)
    try {
      await apiLogin(credentials)
      await loadMe()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  async function register({ email, password, chess_username }) {
    setError(null)
    try {
      await apiRegister({ email, password, chess_username })
      return await login({ email, password }) // log in immediately after registering
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}