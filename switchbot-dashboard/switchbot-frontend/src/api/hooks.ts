import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { REFRESH_INTERVAL_MS } from '../constants'
import { fetchHistory, fetchMeters, fetchStatus, triggerRefresh } from './client'
import type { TimeScale } from './types'

export function useMeters() {
  return useQuery({
    queryKey: ['meters'],
    queryFn: fetchMeters,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useHistory(deviceId: string, timeScale: TimeScale, enabled: boolean) {
  return useQuery({
    queryKey: ['history', deviceId, timeScale],
    queryFn: () => fetchHistory(deviceId, timeScale),
    refetchInterval: REFRESH_INTERVAL_MS,
    enabled,
  })
}

export function useRefreshMeters() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: triggerRefresh,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['meters'] })
      void queryClient.invalidateQueries({ queryKey: ['status'] })
      void queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}
