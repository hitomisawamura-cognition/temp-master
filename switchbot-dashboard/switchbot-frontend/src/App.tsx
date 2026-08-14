import { useMemo, useState } from 'react'
import { useMeters, useRefreshMeters, useStatus } from './api/hooks'
import { apiUrl } from './api/client'
import type { TimeScale } from './api/types'
import { ErrorBanner, RateLimitBanner } from './components/Banners'
import { Controls } from './components/Controls'
import { Header } from './components/Header'
import { MeterCard } from './components/MeterCard'
import { StaleMetersSection } from './components/StaleMetersSection'
import { StatusBar } from './components/StatusBar'
import { formatClockTime, isStaleMeter } from './utils/format'

function errorMessage(prefix: string, error: unknown): string {
  return `${prefix}: ${error instanceof Error ? error.message : String(error)}`
}

export default function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const meters = useMeters()
  const status = useStatus()
  const refresh = useRefreshMeters()

  const { active, stale } = useMemo(() => {
    const list = meters.data?.meters ?? []
    return {
      active: list.filter((meter) => !isStaleMeter(meter)),
      stale: list.filter((meter) => isStaleMeter(meter)),
    }
  }, [meters.data])

  const connected = !meters.isError && !status.isError
  const loading = meters.isPending || status.isPending
  const lastRefresh =
    meters.dataUpdatedAt > 0 ? formatClockTime(new Date(meters.dataUpdatedAt)) : null

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header connected={connected} />

      <main className="mx-auto max-w-[1600px] space-y-4 p-4">
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => refresh.mutate()}
          onDownloadBackup={() => window.open(apiUrl('/api/backup'), '_blank')}
          refreshing={refresh.isPending}
        />

        {status.data && (
          <StatusBar metersCount={status.data.meters_count} lastRefresh={lastRefresh} />
        )}

        {status.data?.is_rate_limited && (
          <RateLimitBanner backoffRemaining={status.data.backoff_remaining} />
        )}

        {meters.isError && <ErrorBanner message={errorMessage('Failed to fetch meters', meters.error)} />}
        {status.isError && <ErrorBanner message={errorMessage('Failed to fetch status', status.error)} />}
        {refresh.isError && <ErrorBanner message={errorMessage('Failed to refresh', refresh.error)} />}

        {loading && <p className="py-10 text-center text-muted">Loading temperature data...</p>}

        {active.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((meter) => (
              <MeterCard key={meter.device_id} meter={meter} timeScale={timeScale} stale={false} />
            ))}
          </div>
        )}

        {stale.length > 0 && <StaleMetersSection meters={stale} timeScale={timeScale} />}

        <footer className="py-6 text-center text-xs text-muted">
          Temp Master Dashboard v1.0 - Built with React + Vite + Tailwind CSS
        </footer>
      </main>
    </div>
  )
}
