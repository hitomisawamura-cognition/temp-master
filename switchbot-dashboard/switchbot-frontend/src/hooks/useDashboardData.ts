import { useQuery } from '@tanstack/react-query'
import { fetchHistory, fetchMeters, fetchStatus } from '../api/client'
import type { TimeScale } from '../api/types'
import { REFRESH_INTERVAL } from '../utils/meters'

export function useMeters() {
  return useQuery({
    queryKey: ['meters'],
    queryFn: fetchMeters,
    refetchInterval: REFRESH_INTERVAL,
  })
}

export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: REFRESH_INTERVAL,
  })
}

export function useHistory(deviceId: string, timeScale: TimeScale, enabled = true) {
  return useQuery({
    queryKey: ['history', deviceId, timeScale],
    queryFn: () => fetchHistory(deviceId, timeScale),
    refetchInterval: REFRESH_INTERVAL,
    enabled,
  })
}
