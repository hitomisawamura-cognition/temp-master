import { useCallback, useEffect } from 'react';
import { fetchHistory } from '../api/client';
import type { MeterReading, TimeScale } from '../api/types';
import { useResource } from './useResource';

interface HistoryResult {
  timeScale: TimeScale;
  history: MeterReading[];
}

/**
 * Fetches temperature history for one device. Re-fetches whenever the device,
 * time scale or `refreshKey` changes. Only returns readings that belong to the
 * currently selected time scale, so the chart is cleared while a new range loads.
 */
export function useHistory(deviceId: string, timeScale: TimeScale, refreshKey: unknown): MeterReading[] {
  const fetcher = useCallback(
    async (signal: AbortSignal): Promise<HistoryResult> => {
      const data = await fetchHistory(deviceId, timeScale, signal);
      return { timeScale, history: data?.history ?? [] };
    },
    [deviceId, timeScale],
  );
  const { data, reload } = useResource(fetcher);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  return data && data.timeScale === timeScale ? data.history : [];
}
