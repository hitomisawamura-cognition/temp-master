import { useCallback, useEffect, useRef, useState } from 'react';
import { getMeters, getStatus, refreshMeters } from '../api';
import type { MeterDevice, StatusResponse } from '../types';

const REFRESH_INTERVAL = 30000;

interface UseMetersResult {
  meters: MeterDevice[];
  status: StatusResponse | null;
  loading: boolean;
  refreshing: boolean;
  connected: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => Promise<void>;
}

export function useMeters(): UseMetersResult {
  const [meters, setMeters] = useState<MeterDevice[]>([]);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const requestInFlight = useRef(false);

  const reload = useCallback(async (): Promise<void> => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    try {
      const [metersResponse, statusResponse] = await Promise.all([
        getMeters(),
        getStatus(),
      ]);
      setMeters(metersResponse.meters ?? []);
      setStatus(statusResponse);
      setConnected(true);
      setError(null);
      setLastRefresh(new Date());
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : String(loadError);
      setConnected(false);
      setError(message);
    } finally {
      setLoading(false);
      requestInFlight.current = false;
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    if (requestInFlight.current) return;
    setRefreshing(true);
    try {
      await refreshMeters();
      await reload();
    } catch (refreshError) {
      const message =
        refreshError instanceof Error ? refreshError.message : String(refreshError);
      setConnected(false);
      setError(`Failed to refresh: ${message}`);
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  useEffect(() => {
    void reload();
    const intervalId = window.setInterval(() => {
      void reload();
    }, REFRESH_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, [reload]);

  return {
    meters,
    status,
    loading,
    refreshing,
    connected,
    error,
    lastRefresh,
    refresh,
  };
}
