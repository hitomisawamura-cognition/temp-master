import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMeters, fetchStatus, triggerRefresh } from '../api/client';
import { REFRESH_INTERVAL_MS } from '../constants';
import type { Meter, StatusResponse } from '../types';

interface DashboardData {
  meters: Meter[];
  status: StatusResponse | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastRefresh: Date | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  requestCollection: () => Promise<void>;
}

/**
 * メーター一覧とバックエンドのステータスを取得し、30秒ごとに自動更新する。
 */
export function useDashboardData(): DashboardData {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      const metersResponse = await fetchMeters();
      const statusResponse = await fetchStatus();
      if (!mounted.current) return;
      setMeters(metersResponse.meters ?? []);
      setStatus(statusResponse);
      setError(null);
      setConnected(true);
      setLastRefresh(new Date());
    } catch (err) {
      if (!mounted.current) return;
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`);
      setConnected(false);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => void reload(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reload]);

  const requestCollection = useCallback(async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
    } catch (err) {
      if (mounted.current) {
        setError(`Failed to refresh: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      await reload();
      if (mounted.current) {
        setRefreshing(false);
      }
    }
  }, [reload]);

  return {
    meters,
    status,
    loading,
    error,
    connected,
    lastRefresh,
    refreshing,
    reload,
    requestCollection,
  };
}
