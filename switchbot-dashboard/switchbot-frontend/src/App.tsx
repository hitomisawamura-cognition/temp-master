import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  HistoryResponse,
  Meter,
  MetersResponse,
  StatusResponse,
  TimeScale,
} from './types';
import { request, downloadBackup } from './api';
import { getDisplayName } from './displayNames';
import { isStaleMeter } from './utils';
import { applyTheme, initialTheme } from './theme';
import type { Theme } from './theme';
import { HistoryChart } from './HistoryChart';

function MeterCard({
  meter,
  scale,
  theme,
  stale = false,
}: {
  meter: Meter;
  scale: TimeScale;
  theme: Theme;
  stale?: boolean;
}) {
  const history = useQuery({
    queryKey: [meter.device_id, scale],
    queryFn: () =>
      request<HistoryResponse>(
        '/api/meters/' +
          encodeURIComponent(meter.device_id) +
          '/history?time_scale=' +
          scale,
      ),
    enabled: !stale,
    refetchInterval: 30000,
  });
  return (
    <article className={'meter-card' + (stale ? ' stale-card' : '')}>
      <header className="card-header">
        <h3>{getDisplayName(meter.device_name)}</h3>
        <span className="tag">{meter.device_type}</span>
      </header>
      <div className="card-body">
        {stale && <p className="stale-badge">7日以上未更新</p>}
        <div className="stats">
          {meter.current_temperature != null && (
            <span className="stat temperature">
              <small>TEMPERATURE</small>
              <strong>
                {meter.current_temperature.toFixed(1)}
                <em>°C</em>
              </strong>
            </span>
          )}
          {meter.current_humidity != null && (
            <span className="stat humidity">
              <small>HUMIDITY</small>
              <strong>
                {meter.current_humidity}
                <em>%</em>
              </strong>
            </span>
          )}
          {meter.battery != null && (
            <span className="battery">Battery {meter.battery}%</span>
          )}
        </div>
        {stale ? (
          <p className="muted">履歴データの取得対象外</p>
        ) : (
          <>
            {history.isPending && <p className="muted">Loading history...</p>}
            {history.isError && (
              <p role="alert" className="error">
                History: {history.error.message}
              </p>
            )}
            {history.data && (
              <HistoryChart
                history={history.data.history}
                scale={scale}
                theme={theme}
              />
            )}
            {history.data?.history.length === 0 && (
              <p className="muted">No history available.</p>
            )}
          </>
        )}
        <p className="updated">
          Last updated:{' '}
          {meter.last_updated && Number.isFinite(Date.parse(meter.last_updated))
            ? new Date(meter.last_updated).toLocaleString()
            : '値がありません（データ未受信）'}
        </p>
      </div>
    </article>
  );
}
export function App() {
  const [scale, setScale] = useState<TimeScale>('day');
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const client = useQueryClient();
  const meters = useQuery({
    queryKey: ['meters'],
    queryFn: () => request<MetersResponse>('/api/meters'),
    refetchInterval: 30000,
  });
  const status = useQuery({
    queryKey: ['status'],
    queryFn: () => request<StatusResponse>('/api/status'),
    refetchInterval: 30000,
  });
  const refresh = useMutation({
    mutationFn: () => request('/api/meters/refresh', { method: 'POST' }),
    onSettled: () => client.invalidateQueries(),
  });
  const backup = useMutation({ mutationFn: downloadBackup });
  const connected =
    meters.isSuccess && status.isSuccess && !meters.isError && !status.isError;
  const active = meters.data?.meters.filter((m) => !isStaleMeter(m)) ?? [];
  const stale = meters.data?.meters.filter((m) => isStaleMeter(m)) ?? [];
  return (
    <>
      <nav>
        <div className="nav-brand">
          <span className="brand-icon">T°</span>
          <div>
            <h1>Temp Master Dashboard</h1>
            <span className="nav-subtitle">ENVIRONMENT MONITORING</span>
          </div>
        </div>
        <div className="nav-tools">
          <label>
            Theme{' '}
            <select
              aria-label="Theme"
              value={theme}
              onChange={(e) => {
                const next = e.target.value as Theme;
                applyTheme(next);
                setTheme(next);
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="industrial">Industrial</option>
            </select>
          </label>
          <span className={'connection ' + (connected ? 'online' : 'offline')}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </nav>
      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">LIVE OVERVIEW</p>
            <h2>Temperature monitoring</h2>
            <p className="muted">
              Real-time conditions across your connected devices.
            </p>
          </div>
          <span className="poll-label">↻ Auto-refresh · 30s</span>
        </div>
        <section className="controls">
          <label>
            Time Range:{' '}
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value as TimeScale)}
            >
              {(
                [
                  ['hour', 'Last Hour'],
                  ['day', 'Last 24 Hours'],
                  ['week', 'Last 7 Days'],
                  ['month', 'Last 30 Days'],
                  ['year', 'Last Year'],
                ] as const
              ).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="actions">
            <button
              className="primary"
              disabled={refresh.isPending}
              onClick={() => refresh.mutate()}
            >
              {refresh.isPending ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button disabled={backup.isPending} onClick={() => backup.mutate()}>
              {backup.isPending ? 'Downloading...' : 'Download Backup'}
            </button>
          </div>
        </section>
        {(refresh.isError || backup.isError) && (
          <p className="notice error" role="alert">
            {refresh.error?.message ?? backup.error?.message}
          </p>
        )}
        {status.data && (
          <div className="status-bar">
            <span>
              Monitoring <strong>{status.data.meters_count}</strong> meters
            </span>
            <span>
              Last refresh:{' '}
              {new Date(
                Math.max(meters.dataUpdatedAt, status.dataUpdatedAt),
              ).toLocaleTimeString()}
            </span>
          </div>
        )}
        {status.data?.is_rate_limited && (
          <p className="notice warning" role="alert">
            Rate Limited. SwitchBot API rate limit reached. Retry in{' '}
            {status.data.backoff_remaining} seconds.
          </p>
        )}
        {(meters.isPending || status.isPending) && (
          <p className="notice">Loading temperature data...</p>
        )}
        {(meters.isError || status.isError) && (
          <p className="notice error" role="alert">
            Failed to fetch data:{' '}
            {meters.error?.message ?? status.error?.message}
          </p>
        )}
        {meters.data?.meters.length === 0 && (
          <p className="notice">No meters found.</p>
        )}
        <div className="meter-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {active.map((m) => (
            <MeterCard
              key={m.device_id}
              meter={m}
              scale={scale}
              theme={theme}
            />
          ))}
        </div>
        {stale.length > 0 && (
          <section className="stale-section">
            <h2>⚠ 未更新のメーター</h2>
            <p>1週間以上更新されていないデバイス</p>
            <div className="meter-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {stale.map((m) => (
                <MeterCard
                  key={m.device_id}
                  meter={m}
                  scale={scale}
                  theme={theme}
                  stale
                />
              ))}
            </div>
          </section>
        )}
        <footer>
          Temp Master Dashboard v2.0 - Built with React + TypeScript
        </footer>
      </main>
    </>
  );
}
