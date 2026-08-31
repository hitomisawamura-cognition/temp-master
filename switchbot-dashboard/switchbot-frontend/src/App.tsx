import { useState } from 'react'
import { Controls } from './components/Controls'
import { MeterCard } from './components/MeterCard'
import { Navbar } from './components/Navbar'
import { StaleMetersSection } from './components/StaleMetersSection'
import { StatusBar } from './components/StatusBar'
import { useMetersQuery, useRefreshMutation, useStatusQuery } from './hooks/useDashboardData'
import { backupUrl } from './lib/api'
import { isStaleMeter } from './lib/format'
import type { TimeScale } from './types/api'

export default function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day')

  const metersQuery = useMetersQuery()
  const statusQuery = useStatusQuery()
  const refreshMutation = useRefreshMutation()

  const meters = metersQuery.data?.meters ?? []
  const activeMeters = meters.filter((meter) => !isStaleMeter(meter))
  const staleMeters = meters.filter((meter) => isStaleMeter(meter))

  const connected = !metersQuery.isError && !statusQuery.isError
  const fetchError = metersQuery.error ?? statusQuery.error
  const errorMessage = refreshMutation.error
    ? `Failed to refresh: ${refreshMutation.error.message}`
    : fetchError
      ? `Failed to fetch data: ${fetchError.message}`
      : null
  const lastRefresh = statusQuery.dataUpdatedAt ? new Date(statusQuery.dataUpdatedAt) : null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar connected={connected} />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => refreshMutation.mutate()}
          onDownloadBackup={() => window.open(backupUrl(), '_blank')}
          refreshing={refreshMutation.isPending}
        />

        <StatusBar status={statusQuery.data} lastRefresh={lastRefresh} />

        {errorMessage && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <strong className="font-semibold">Error.</strong> {errorMessage}
          </div>
        )}

        {metersQuery.isPending ? (
          <p className="py-10 text-center text-slate-500 dark:text-slate-400">
            Loading temperature data...
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeMeters.map((meter) => (
                <MeterCard
                  key={meter.device_id}
                  meter={meter}
                  timeScale={timeScale}
                  stale={false}
                />
              ))}
            </div>
            <StaleMetersSection meters={staleMeters} timeScale={timeScale} />
          </>
        )}

        <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Temp Master Dashboard v2.0 - Built with React + Tailwind CSS
        </footer>
      </main>
    </div>
  )
}
