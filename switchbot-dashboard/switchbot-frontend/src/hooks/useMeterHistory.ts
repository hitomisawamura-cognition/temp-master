import { useEffect, useState } from 'react';
import { fetchHistory } from '../api/client';
import type { MeterReading, TimeScale } from '../types';

/**
 * 指定デバイスの温度履歴を取得する。
 * 時間スケールの変更時と、refreshToken が更新された自動更新時に再取得する。
 */
export function useMeterHistory(
  deviceId: string,
  timeScale: TimeScale,
  enabled: boolean,
  refreshToken: number,
) {
  const [history, setHistory] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setHistory([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchHistory(deviceId, timeScale)
      .then((data) => {
        if (cancelled) return;
        setHistory(data.history ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setHistory([]);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deviceId, timeScale, enabled, refreshToken]);

  return { history, loading };
}
