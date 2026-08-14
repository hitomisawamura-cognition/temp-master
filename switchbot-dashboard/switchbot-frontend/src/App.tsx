import { useEffect, useMemo, useState } from 'react'
import { backupUrl } from './api/client'
import type { TimeScale } from './api/types'
import { MeterCard } from './components/MeterCard'
import { RateLimitWarning } from './components/RateLimitWarning'
import { StaleMetersSection } from './components/StaleMetersSection'
import { StatusBar } from './components/StatusBar'
import { ThemeToggle } from './components/ThemeToggle'
import { TimeScaleSelect } from './components/TimeScaleSelect'
import { useMeters, useRefreshMeters, useStatus } from './hooks/useDashboardData'
import { isStaleMeter } from './lib/format'

export default function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const metersQuery = useMeters()
  const statusQuery = useStatus()
  const refreshMutation = useRefreshMeters()

  const meters = metersQuery.data?.meters ?? []
  const status = statusQuery.data
  const isConnected = !metersQuery.isError && !statusQuery.isError

  useEffect(() => {
    if (statusQuery.dataUpdatedAt) {
      setLastRefresh(new Date(statusQuery.dataUpdatedAt))
    }
  }, [statusQuery.dataUpdatedAt])

  const { activeMeters, staleMeters } = useMemo(() => {
    const active = []
    const stale = []
    for (const meter of meters) {
      if (isStaleMeter(meter)) {
        stale.push(meter)
      } else {
        active.push(meter)
      }
    }
    return { activeMeters: active, staleMeters: stale }
  }, [meters])

  const errorMessage = metersQuery.isError
    ? `Failed to fetch meters: ${(metersQuery.error as Error).message}`
    : statusQuery.isError
      ? `Failed to fetch status: ${(statusQuery.error as Error).message}`
      : refreshMutation.isError
        ? `Failed to refresh: ${(refreshMutation.error as Error).message}`
        : null

  const isLoading = metersQuery.isPending || statusQuery.isPending

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="logo-dot" aria-hidden="true" />
          Temp Master Dashboard
        </div>
        <div className="navbar-right">
          <span className={`badge ${isConnected ? 'badge-success' : 'badge-danger'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <main className="container">
        <div className="controls">
          <TimeScaleSelect value={timeScale} onChange={setTimeScale} />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => window.open(backupUrl(), '_blank')}
          >
            Download Backup
          </button>
        </div>

        {status && (
          <StatusBar metersCount={status.meters_count} lastRefresh={lastRefresh} />
        )}

        {status?.is_rate_limited && (
          <RateLimitWarning backoffRemaining={status.backoff_remaining ?? 0} />
        )}

        {errorMessage && (
          <div className="alert alert-danger">
            <span>
              <strong>Error.</strong> {errorMessage}
            </span>
          </div>
        )}

        {isLoading ? (
          <p className="loading">Loading temperature data...</p>
        ) : (
          <>
            {activeMeters.length > 0 ? (
              <div className="meter-grid">
                {activeMeters.map((meter) => (
                  <MeterCard
                    key={meter.device_id}
                    meter={meter}
                    timeScale={timeScale}
                  />
                ))}
              </div>
            ) : (
              !metersQuery.isError && <p className="empty">No active meters.</p>
            )}

            {staleMeters.length > 0 && (
              <StaleMetersSection meters={staleMeters} timeScale={timeScale} />
            )}
          </>
        )}

        <footer className="footer">
          Temp Master Dashboard v2.0 - Built with Vite + React 18 + TypeScript
        </footer>
      </main>
    </div>
  )
}
