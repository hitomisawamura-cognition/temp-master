import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchHistory, fetchMeters, fetchStatus, triggerRefresh } from '../lib/api'
import { REFRESH_INTERVAL } from '../lib/constants'
import type { TimeScale } from '../types/api'

export function useMetersQuery() {
  return useQuery({
    queryKey: ['meters'],
    queryFn: fetchMeters,
    refetchInterval: REFRESH_INTERVAL,
  })
}

export function useStatusQuery() {
  return useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: REFRESH_INTERVAL,
  })
}

export function useHistoryQuery(deviceId: string, timeScale: TimeScale, enabled: boolean) {
  return useQuery({
    queryKey: ['history', deviceId, timeScale],
    queryFn: () => fetchHistory(deviceId, timeScale),
    refetchInterval: REFRESH_INTERVAL,
    enabled,
  })
}

export function useRefreshMutation() {
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
