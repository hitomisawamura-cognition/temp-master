import { useMemo, useState } from 'react';
import { downloadBackup } from './api';
import { MeterCard } from './components/MeterCard';
import { RateLimitWarning } from './components/RateLimitWarning';
import { StaleMeterSection } from './components/StaleMeterSection';
import { StatusBar } from './components/StatusBar';
import { ThemeToggle } from './components/ThemeToggle';
import { useMeters } from './hooks/useMeters';
import { useTheme } from './theme';
import type { MeterDevice, TimeScale } from './types';
import './styles.css';

const timeScaleOptions: Array<{ value: TimeScale; label: string }> = [
  { value: 'hour', label: 'Last Hour' },
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last Year' },
];

const STALE_METER_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export function isStaleMeter(meter: MeterDevice): boolean {
  if (!meter.last_updated) return true;
  const lastUpdated = new Date(meter.last_updated);
  if (Number.isNaN(lastUpdated.getTime())) return true;
  return Date.now() - lastUpdated.getTime() >= STALE_METER_THRESHOLD_MS;
}

function App(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const [timeScale, setTimeScale] = useState<TimeScale>('day');
  const {
    meters,
    status,
    loading,
    refreshing,
    connected,
    error,
    lastRefresh,
    refresh,
  } = useMeters();
  const { activeMeters, staleMeters } = useMemo(
    () =>
      meters.reduce(
        (groups, meter) => {
          if (isStaleMeter(meter)) groups.staleMeters.push(meter);
          else groups.activeMeters.push(meter);
          return groups;
        },
        { activeMeters: [] as MeterDevice[], staleMeters: [] as MeterDevice[] },
      ),
    [meters],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Temp Master Dashboard</div>
        <nav aria-label="Primary navigation">
          <a className="nav-link active" href="/">Dashboard</a>
        </nav>
        <div className="header-actions">
          <span className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="page-content">
        <section className="controls-panel" aria-label="Dashboard controls">
          <label htmlFor="time-scale-select">Time Range:</label>
          <select
            id="time-scale-select"
            value={timeScale}
            onChange={(event) => setTimeScale(event.target.value as TimeScale)}
          >
            {timeScaleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            className="button primary"
            type="button"
            disabled={refreshing}
            onClick={() => void refresh()}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button className="button secondary" type="button" onClick={downloadBackup}>
            Download Backup
          </button>
        </section>

        {status && <StatusBar metersCount={status.meters_count} lastRefresh={lastRefresh} />}
        {status?.is_rate_limited && (
          <RateLimitWarning remaining={status.backoff_remaining} />
        )}
        {error && <div className="error-banner" role="alert"><strong>Error.</strong> {error}</div>}
        {loading ? (
          <div className="loading-state">Loading temperature data...</div>
        ) : (
          <>
            <div className="meter-grid">
              {activeMeters.map((meter) => (
                <MeterCard
                  key={meter.device_id}
                  meter={meter}
                  stale={false}
                  timeScale={timeScale}
                  theme={theme}
                />
              ))}
            </div>
            <StaleMeterSection meters={staleMeters} timeScale={timeScale} theme={theme} />
          </>
        )}
      </main>

      <footer>Temp Master Dashboard v1.0 - Built with React + Vite</footer>
    </div>
  );
}

export default App;
