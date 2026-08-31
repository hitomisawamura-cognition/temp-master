import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchMeters, fetchStatus, triggerRefresh } from '../api/client'
import type { MeterDevice, StatusResponse } from '../api/types'
import { REFRESH_INTERVAL } from '../constants'

interface DashboardData {
  meters: MeterDevice[]
  status: StatusResponse | null
  lastRefreshedAt: Date | null
  loading: boolean
  error: string | null
  refreshing: boolean
  refresh: () => Promise<void>
}

export function useDashboardData(): DashboardData {
  const [meters, setMeters] = useState<MeterDevice[]>([])
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const mounted = useRef(true)

  const fetchData = useCallback(async () => {
    try {
      const [metersResponse, statusResponse] = await Promise.all([
        fetchMeters(),
        fetchStatus(),
      ])
      if (!mounted.current) return
      setMeters(metersResponse.meters ?? [])
      setStatus(statusResponse)
      setLastRefreshedAt(new Date())
      setError(null)
    } catch (err) {
      if (!mounted.current) return
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      if (mounted.current) {
        setLoading(false)
      }
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await triggerRefresh()
    } catch (err) {
      if (mounted.current) {
        setError(`Failed to refresh: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    await fetchData()
    if (mounted.current) {
      setRefreshing(false)
    }
  }, [fetchData])

  useEffect(() => {
    mounted.current = true
    void fetchData()
    const timer = setInterval(() => void fetchData(), REFRESH_INTERVAL)
    return () => {
      mounted.current = false
      clearInterval(timer)
    }
  }, [fetchData])

  return { meters, status, lastRefreshedAt, loading, error, refreshing, refresh }
}
