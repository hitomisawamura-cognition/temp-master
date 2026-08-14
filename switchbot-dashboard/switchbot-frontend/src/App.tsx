import { useState } from 'react';
import { openBackupDownload } from './api/client';
import type { TimeScale } from './api/types';
import { Controls } from './components/Controls';
import { MeterGrid } from './components/MeterGrid';
import { Navbar } from './components/Navbar';
import { RateLimitWarning } from './components/RateLimitWarning';
import { StaleMeterSection } from './components/StaleMeterSection';
import { StatusBar } from './components/StatusBar';
import { useMetersQuery, useRefreshMutation, useStatusQuery } from './hooks/useDashboardData';
import { splitMetersByStaleness } from './utils/staleMeter';

interface RefreshFailure {
  message: string;
  /** `dataUpdatedAt` of the meters query when the refresh failed. */
  metersUpdatedAt: number;
}

export function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day');
  const [refreshFailure, setRefreshFailure] = useState<RefreshFailure | null>(null);

  const metersQuery = useMetersQuery();
  const statusQuery = useStatusQuery();
  const refreshMutation = useRefreshMutation();

  const meters = metersQuery.data?.meters ?? [];
  const status = statusQuery.data;
  const { activeMeters, staleMeters } = splitMetersByStaleness(meters);

  const handleRefresh = () => {
    const metersUpdatedAt = metersQuery.dataUpdatedAt;
    setRefreshFailure(null);
    refreshMutation.mutate(undefined, {
      onError: (mutationError) =>
        setRefreshFailure({ message: mutationError.message, metersUpdatedAt }),
    });
  };

  const isLoading = metersQuery.isPending || statusQuery.isPending;
  // A refresh failure is only relevant until fresher meter data arrives.
  const staleRefreshFailure =
    refreshFailure && metersQuery.dataUpdatedAt <= refreshFailure.metersUpdatedAt
      ? refreshFailure.message
      : null;
  const error = metersQuery.error?.message ?? statusQuery.error?.message ?? staleRefreshFailure;
  const isConnected = !metersQuery.isError && !statusQuery.isError;
  const lastRefresh = metersQuery.dataUpdatedAt ? new Date(metersQuery.dataUpdatedAt) : null;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar isConnected={isConnected} />

      <main className="px-4 pt-4 pb-8">
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={handleRefresh}
          onDownloadBackup={openBackupDownload}
          isRefreshing={refreshMutation.isPending}
        />

        {status && <StatusBar metersCount={status.meters_count} lastRefresh={lastRefresh} />}

        {status?.is_rate_limited && (
          <RateLimitWarning backoffRemaining={status.backoff_remaining} />
        )}

        {error && (
          <div className="mb-4 rounded border border-danger bg-panel px-4 py-2 text-sm text-danger">
            <strong>Error.</strong> {error}
          </div>
        )}

        {isLoading ? (
          <p className="py-10 text-center text-muted">Loading temperature data...</p>
        ) : (
          <>
            <MeterGrid meters={activeMeters} timeScale={timeScale} />
            <StaleMeterSection meters={staleMeters} timeScale={timeScale} />
          </>
        )}

        <footer className="mt-8 text-center text-xs text-muted">
          Temp Master Dashboard v1.0 - Built with Vite + React + TypeScript
        </footer>
      </main>
    </div>
  );
}
