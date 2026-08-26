import { useCallback, useEffect, useState } from 'react';
import {
  fetchHistory,
  fetchMeters,
  fetchStatus,
  getBackupUrl,
  triggerRefresh,
  type MeterDevice,
  type MeterReading,
  type Status,
  type TimeScale,
} from './api';
import { Controls } from './components/Controls';
import { isStaleMeter, MeterGrid } from './components/MeterGrid';
import { Navbar } from './components/Navbar';
import { StaleMetersSection } from './components/StaleMetersSection';
import { StatusBar } from './components/StatusBar';
import { useTheme } from './hooks/useTheme';

export const REFRESH_INTERVAL = 30000;

export function App() {
  const [theme, toggleTheme] = useTheme();
  const [meters, setMeters] = useState<MeterDevice[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [histories, setHistories] = useState<Record<string, MeterReading[]>>({});
  const [timeScale, setTimeScale] = useState<TimeScale>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      const metersResponse = await fetchMeters();
      const statusResponse = await fetchStatus();
      const nextMeters = metersResponse.meters || [];
      setMeters(nextMeters);
      setStatus(statusResponse);
      setConnected(true);
      setError(null);
      setLoading(false);
      setLastRefresh(new Date());

      const activeMeters = nextMeters.filter((meter) => !isStaleMeter(meter));
      const historyEntries = await Promise.all(
        activeMeters.map(async (meter) => {
          try {
            const response = await fetchHistory(meter.device_id, timeScale);
            return [meter.device_id, response.history || []] as const;
          } catch {
            return [meter.device_id, []] as const;
          }
        }),
      );
      setHistories(Object.fromEntries(historyEntries));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : String(requestError);
      setLoading(false);
      setConnected(false);
      setError(`Failed to fetch data: ${message}`);
    }
  }, [timeScale]);

  useEffect(() => {
    void loadData();
    const interval = window.setInterval(() => {
      void loadData();
    }, REFRESH_INTERVAL);
    return () => window.clearInterval(interval);
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await triggerRefresh();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : String(requestError);
      setError(`Failed to refresh: ${message}`);
    }
    await loadData();
    setIsRefreshing(false);
  };

  const handleBackup = () => {
    window.open(getBackupUrl(), '_blank');
  };

  return (
    <>
      <Navbar connected={connected} theme={theme} onToggleTheme={toggleTheme} />
      <main className="page-container">
        <Controls
          timeScale={timeScale}
          isRefreshing={isRefreshing}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => void handleRefresh()}
          onBackup={handleBackup}
        />
        <StatusBar status={status} lastRefresh={lastRefresh} />
        {loading && <div className="loading">Loading temperature data...</div>}
        {error && (
          <div className="alert alert-danger">
            <strong>Error.</strong> {error}
          </div>
        )}
        {!loading && (
          <>
            <MeterGrid meters={meters} histories={histories} timeScale={timeScale} theme={theme} />
            <StaleMetersSection
              meters={meters}
              histories={histories}
              timeScale={timeScale}
              theme={theme}
            />
          </>
        )}
        <footer>Temp Master Dashboard v1.0 - Built with React + Recharts</footer>
      </main>
    </>
  );
}
