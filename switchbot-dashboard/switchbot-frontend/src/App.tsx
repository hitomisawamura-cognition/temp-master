import { useMemo, useState } from 'react';
import { Controls } from './components/Controls';
import { MeterCard } from './components/MeterCard';
import { Navbar } from './components/Navbar';
import { RateLimitWarning } from './components/RateLimitWarning';
import { StaleMetersSection } from './components/StaleMetersSection';
import { StatusBar } from './components/StatusBar';
import { openBackup } from './api/client';
import { useDashboardData } from './hooks/useDashboardData';
import { useTheme } from './hooks/useTheme';
import { isStaleMeter } from './utils/format';
import type { TimeScale } from './types';

export default function App() {
  const { mode, isDark, setMode } = useTheme();
  const [timeScale, setTimeScale] = useState<TimeScale>('day');
  const { meters, status, loading, error, connected, lastRefresh, refreshing, requestCollection } =
    useDashboardData();

  const { activeMeters, staleMeters } = useMemo(() => {
    const active = [];
    const stale = [];
    for (const meter of meters) {
      if (isStaleMeter(meter)) {
        stale.push(meter);
      } else {
        active.push(meter);
      }
    }
    return { activeMeters: active, staleMeters: stale };
  }, [meters]);

  // 自動更新のたびにチャートも再取得させるためのトークン
  const refreshToken = lastRefresh ? lastRefresh.getTime() : 0;

  return (
    <div className="min-h-screen">
      <Navbar connected={connected} themeMode={mode} onThemeChange={setMode} />

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6">
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => void requestCollection()}
          onBackup={openBackup}
          refreshing={refreshing}
        />

        <StatusBar status={status} lastRefresh={lastRefresh} />

        {status?.is_rate_limited && (
          <RateLimitWarning backoffRemaining={status.backoff_remaining ?? 0} />
        )}

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
            <strong className="font-semibold">Error.</strong> {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-content-muted">Loading temperature data...</p>
        ) : (
          <>
            {activeMeters.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeMeters.map((meter) => (
                  <MeterCard
                    key={meter.device_id}
                    meter={meter}
                    timeScale={timeScale}
                    isStale={false}
                    isDark={isDark}
                    refreshToken={refreshToken}
                  />
                ))}
              </div>
            )}

            {staleMeters.length > 0 && (
              <StaleMetersSection
                meters={staleMeters}
                timeScale={timeScale}
                isDark={isDark}
                refreshToken={refreshToken}
              />
            )}
          </>
        )}

        <footer className="py-6 text-center text-xs text-content-muted">
          Temp Master Dashboard v2.0 - Built with React + TypeScript + Vite + Tailwind CSS
        </footer>
      </main>
    </div>
  );
}
