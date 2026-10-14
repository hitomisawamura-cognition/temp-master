import { useCallback, useEffect, useMemo, useState } from 'react';
import { BACKUP_URL, triggerRefresh } from './api/client';
import type { Meter, TimeScale } from './api/types';
import styles from './App.module.css';
import { Controls } from './components/Controls';
import { MeterGrid } from './components/MeterGrid';
import { Navbar } from './components/Navbar';
import { StaleMetersSection } from './components/StaleMetersSection';
import { StatusBar } from './components/StatusBar';
import ui from './components/ui.module.css';
import { useMeters } from './hooks/useMeters';
import { useStatus } from './hooks/useStatus';
import { REFRESH_INTERVAL, isStaleMeter } from './lib/meters';

export default function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const meters = useMeters();
  const status = useStatus();
  const { reload: reloadMeters } = meters;
  const { reload: reloadStatus } = status;

  const fetchData = useCallback(async () => {
    const [metersOk, statusOk] = await Promise.all([reloadMeters(), reloadStatus()]);
    return metersOk && statusOk;
  }, [reloadMeters, reloadStatus]);

  useEffect(() => {
    void fetchData();
    const id = window.setInterval(async () => {
      if (await fetchData()) {
        setRefreshError(null);
      }
    }, REFRESH_INTERVAL);
    return () => window.clearInterval(id);
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      await triggerRefresh();
    } catch (err) {
      setRefreshError(`Failed to refresh: ${err instanceof Error ? err.message : String(err)}`);
    }
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleBackup = useCallback(() => {
    window.open(BACKUP_URL, '_blank');
  }, []);

  const { activeMeters, staleMeters } = useMemo(() => {
    const active: Meter[] = [];
    const stale: Meter[] = [];
    for (const meter of meters.data?.meters ?? []) {
      (isStaleMeter(meter) ? stale : active).push(meter);
    }
    return { activeMeters: active, staleMeters: stale };
  }, [meters.data]);

  const error = meters.error
    ? `Failed to fetch meters: ${meters.error}`
    : status.error
      ? `Failed to fetch status: ${status.error}`
      : refreshError;
  const loading = !error && (!meters.data || !status.data);

  return (
    <>
      <Navbar connected={!error} />
      <div className={styles.container}>
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onBackup={handleBackup}
        />

        <StatusBar status={status.data} lastRefresh={status.updatedAt} />

        {loading && (
          <div className={styles.loading}>
            <p className={ui.textMuted}>Loading temperature data...</p>
          </div>
        )}

        {error && (
          <div data-testid="error" className={`${ui.alert} ${ui.alertDanger}`}>
            <strong>Error.</strong> {error}
          </div>
        )}

        {meters.data && (
          <div data-testid="meters-container">
            <MeterGrid meters={activeMeters} isStale={false} timeScale={timeScale} refreshKey={meters.updatedAt} />
            <StaleMetersSection meters={staleMeters} timeScale={timeScale} />
          </div>
        )}

        <footer className={styles.footer}>Temp Master Dashboard v2.0 - Built with Vite + React + TypeScript</footer>
      </div>
    </>
  );
}
