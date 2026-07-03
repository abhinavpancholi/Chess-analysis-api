import { mockRatings, mockGames } from '../mock/mockData.js'

const BASE_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error('VITE_API_URL is not set')
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  })
  if (!res.ok) {
    // FastAPI validation/auth errors come back as { "detail": "..." } —
    // surface that instead of a generic "Request failed: 401".
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch {
      // response wasn't JSON, fall back to statusText
    }
    throw new Error(detail)
  }
  return res.json()
}

export async function getRatings({ days = 30 } = {}) {
  try {
    return await request(`/analytics/rating-trend?days=${days}`)
  } catch (err) {
    console.warn('Falling back to mock ratings:', err.message)
    return mockRatings
  }
}

export async function getGames({ limit = 20 } = {}) {
  try {
    return await request(`/games/?limit=${limit}`)
  } catch (err) {
    console.warn('Falling back to mock games:', err.message)
    return mockGames
  }
}

export async function triggerSync({ year, month }) {
  return request('/games/ingest', { method: 'POST', body: JSON.stringify({ year, month }) })
}

export async function getSyncJob(jobId) {
  return request(`/games/jobs/${jobId}`)
}

// --- Auth ---

export async function register({ email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (data.access_token) setToken(data.access_token) // ← verify field name against your login response
  return data
}

export async function getMe() {
  return request('/auth/me') // ← verify this returns { email, ... }
}