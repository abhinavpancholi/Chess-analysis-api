import { useState, useCallback, useRef, useEffect } from 'react'
import { triggerSync, getSyncJob } from '../api/client.js'

const TERMINAL_STATUSES = ['done', 'failed', 'error'] // "failed"/"error" unconfirmed — treat both as terminal just in case
const POLL_INTERVAL_MS = 1500
const MAX_POLL_MS = 60_000 // stop polling after a minute so a stuck job doesn't spin forever

export function useSyncJob({ onComplete } = {}) {
  const [job, setJob] = useState(null) // latest job status object from the API
  const [error, setError] = useState(null)
  const timeoutRef = useRef(null)
  const startedAtRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling]) // clear on unmount

  const poll = useCallback(
    async (jobId) => {
      try {
        const latest = await getSyncJob(jobId)
        setJob(latest)

        if (TERMINAL_STATUSES.includes(latest.status)) {
          if (latest.status === 'done') onComplete?.(latest)
          return
        }

        if (Date.now() - startedAtRef.current > MAX_POLL_MS) {
          setError('Sync is taking longer than expected — check back in a bit.')
          return
        }

        timeoutRef.current = setTimeout(() => poll(jobId), POLL_INTERVAL_MS)
      } catch (err) {
        setError(err.message)
      }
    },
    [onComplete]
  )

  const startSync = useCallback(
    async ({ year, month }) => {
      setError(null)
      setJob(null)
      try {
        const initial = await triggerSync({ year, month })
        // response is { job_id, status, message } — normalize job_id -> id
        // so `job` always has the same shape as GET /games/jobs/{id}
        setJob({ id: initial.job_id, status: initial.status })
        startedAtRef.current = Date.now()
        poll(initial.job_id)
      } catch (err) {
        setError(err.message)
      }
    },
    [poll]
  )

  return { job, error, startSync, isSyncing: job ? !TERMINAL_STATUSES.includes(job.status) : false }
}