import { useState } from 'react';
import { api, errorMessage } from '@/api/client';
import type { TimeScale } from '@/api/types';
import { Controls } from '@/components/Controls';
import { Header } from '@/components/Header';
import { MeterGrid } from '@/components/MeterGrid';
import { StatusBar } from '@/components/StatusBar';
import { Alert } from '@/components/ui/alert';
import { useMeters, useRefreshMeters, useStatus } from '@/hooks/useDashboardData';
import { useDisplayNames } from '@/hooks/useDisplayNames';

export default function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day');
  const meters = useMeters();
  const status = useStatus();
  const refresh = useRefreshMeters();
  const resolveName = useDisplayNames();

  const fetchError = meters.isError
    ? `Failed to fetch meters: ${errorMessage(meters.error)}`
    : status.isError
      ? `Failed to fetch status: ${errorMessage(status.error)}`
      : null;
  const hasData = meters.isSuccess && status.isSuccess;
  const connected = hasData && !fetchError;
  const loading = (meters.isPending || status.isPending) && !fetchError;
  const lastRefresh = hasData ? new Date(Math.max(meters.dataUpdatedAt, status.dataUpdatedAt)) : null;
  // Like the legacy dashboard, a successful data load after a failed refresh clears the error.
  const refreshFailedSinceLastLoad =
    refresh.isError && (!hasData || Math.min(meters.dataUpdatedAt, status.dataUpdatedAt) < refresh.submittedAt);
  const error = fetchError ?? (refreshFailedSinceLastLoad ? `Failed to refresh: ${errorMessage(refresh.error)}` : null);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Header connected={connected} />
      <main className="space-y-4 px-4 pb-6 pt-[72px]">
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => refresh.mutate()}
          refreshing={refresh.isPending}
          backupUrl={api.backupUrl()}
        />

        <StatusBar status={status.data} lastRefresh={lastRefresh} />

        {loading && <p className="py-10 text-center text-muted-foreground">Loading temperature data...</p>}

        {error && (
          <Alert variant="danger" data-testid="error">
            <strong>Error.</strong>
            <span>{error}</span>
          </Alert>
        )}

        {meters.data && <MeterGrid meters={meters.data.meters ?? []} timeScale={timeScale} resolveName={resolveName} />}

        <footer className="pt-6 text-center text-xs text-muted-foreground">
          Temp Master Dashboard v2.0 - Built with React + Vite
        </footer>
      </main>
    </div>
  );
}
