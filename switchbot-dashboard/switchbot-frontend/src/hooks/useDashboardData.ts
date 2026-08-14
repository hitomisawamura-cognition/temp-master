import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchHistory,
  fetchMeters,
  fetchStatus,
  triggerRefresh,
} from '../api/client'
import type { TimeScale } from '../api/types'

export const REFRESH_INTERVAL = 30000

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

export function useHistory(deviceId: string, timeScale: TimeScale) {
  return useQuery({
    queryKey: ['history', deviceId, timeScale],
    queryFn: () => fetchHistory(deviceId, timeScale),
    refetchInterval: REFRESH_INTERVAL,
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
