import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { TimeScale } from '@/api/types';

export const REFRESH_INTERVAL_MS = 30_000;

const polling = {
  refetchInterval: REFRESH_INTERVAL_MS,
  refetchIntervalInBackground: true,
} as const;

export const queryKeys = {
  meters: ['meters'] as const,
  status: ['status'] as const,
  history: (deviceId: string, timeScale: TimeScale) => ['history', deviceId, timeScale] as const,
};

export function useMeters() {
  return useQuery({ queryKey: queryKeys.meters, queryFn: api.getMeters, ...polling });
}

export function useStatus() {
  return useQuery({ queryKey: queryKeys.status, queryFn: api.getStatus, ...polling });
}

export function useHistory(deviceId: string, timeScale: TimeScale, enabled = true) {
  return useQuery({
    queryKey: queryKeys.history(deviceId, timeScale),
    queryFn: () => api.getHistory(deviceId, timeScale),
    enabled,
    ...polling,
  });
}

/** POST /api/meters/refresh, then refetch everything (like the legacy "Refresh Data" button). */
export function useRefreshMeters() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.refresh,
    onSettled: () => queryClient.invalidateQueries(),
  });
}
