import { mockRatingsResponse, mockGames } from '../mock/mockData.js'
import { bucketTimeControl } from '../utils/transform.js'

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
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
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch {
      // response wasn't JSON, fall back to statusText
    }
    console.error(`Request failed [${res.status}] ${url}:`, detail)
    throw new Error(detail)
  }
  return res.json()
}

export async function getRatings({ days = 30 } = {}) {
  try {
    return await request(`/analytics/rating-trend?days=${days}`)
  } catch (err) {
    console.warn('Falling back to mock ratings:', err.message)
    return mockRatingsResponse
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

/**
 * /games/ has no date-filter param and is sorted newest-first, so finding
 * "games from month X" means paging backward until we've collected
 * everything in that month or scanned past it. While we're paging through
 * anyway, we also track — per time control — the closest game just OUTSIDE
 * the month on the newer side, needed to compute that month's last game's
 * rating change. Capped at 30 pages (3000 games).
 */
export async function getGamesForMonth({ year, month }) {
  const rangeStart = new Date(Date.UTC(year, month - 1, 1))
  const rangeEnd = new Date(Date.UTC(year, month, 1)) // exclusive: first day of next month
  const pageSize = 100
  const maxPages = 30
  const matched = []
  const boundaryByControl = new Map()

  outer: for (let page = 0; page < maxPages; page++) {
    const batch = await request(`/games/?limit=${pageSize}&offset=${page * pageSize}`)
    if (!batch.length) break

    for (const g of batch) {
      const playedAt = new Date(g.played_at)
      if (playedAt >= rangeEnd) {
        // overwritten each time -> ends up holding the closest game to rangeEnd, since batches arrive newest-first
        boundaryByControl.set(bucketTimeControl(g.time_control), g)
      } else if (playedAt >= rangeStart) {
        matched.push(g)
      } else {
        break outer // scanned past the target month — nothing older can match
      }
    }

    if (batch.length < pageSize) break
  }

  return { games: matched, boundaryByControl }
}

export async function triggerSync({ year, month }) {
  return request('/games/ingest', { method: 'POST', body: JSON.stringify({ year, month }) })
}

export async function getSyncJob(jobId) {
  return request(`/games/jobs/${jobId}`)
}

export async function register({ email, password, chess_username }) {
  const payload = { email, password }
  if (chess_username) payload.chess_username = chess_username
  return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export async function login({ email, password }) {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  if (data.access_token) setToken(data.access_token)
  return data
}

export async function getMe() {
  return request('/auth/me')
}