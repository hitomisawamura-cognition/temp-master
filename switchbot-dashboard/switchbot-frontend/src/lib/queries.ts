import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TimeScale } from '../types'
import { api } from './api'

export const REFRESH_INTERVAL_MS = 30_000

export const queryKeys = {
  meters: ['meters'] as const,
  status: ['status'] as const,
  history: (deviceId: string, timeScale: TimeScale) => ['history', deviceId, timeScale] as const,
}

export function useMeters() {
  return useQuery({
    queryKey: queryKeys.meters,
    queryFn: ({ signal }) => api.meters(signal),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useStatus() {
  return useQuery({
    queryKey: queryKeys.status,
    queryFn: ({ signal }) => api.status(signal),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useHistory(deviceId: string, timeScale: TimeScale, enabled = true) {
  return useQuery({
    queryKey: queryKeys.history(deviceId, timeScale),
    queryFn: ({ signal }) => api.history(deviceId, timeScale, signal),
    refetchInterval: REFRESH_INTERVAL_MS,
    enabled,
    select: (data) =>
      data.history.map((r) => ({
        t: new Date(r.timestamp).getTime(),
        temperature: r.temperature,
        humidity: r.humidity,
      })),
  })
}

export function useRefreshMeters() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.refresh,
    onSettled: () => queryClient.invalidateQueries(),
  })
}
