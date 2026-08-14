import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHistory, fetchMeters, fetchStatus, refreshMeters } from '../api/client';
import type { TimeScale } from '../api/types';

export const REFRESH_INTERVAL = 30000;

export function useMetersQuery() {
  return useQuery({
    queryKey: ['meters'],
    queryFn: ({ signal }) => fetchMeters(signal),
    refetchInterval: REFRESH_INTERVAL,
  });
}

export function useStatusQuery() {
  return useQuery({
    queryKey: ['status'],
    queryFn: ({ signal }) => fetchStatus(signal),
    refetchInterval: REFRESH_INTERVAL,
  });
}

export function useHistoryQuery(deviceId: string, timeScale: TimeScale) {
  return useQuery({
    queryKey: ['history', deviceId, timeScale],
    queryFn: ({ signal }) => fetchHistory(deviceId, timeScale, signal),
    refetchInterval: REFRESH_INTERVAL,
  });
}

export function useRefreshMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshMeters,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meters'] });
      void queryClient.invalidateQueries({ queryKey: ['status'] });
      void queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
