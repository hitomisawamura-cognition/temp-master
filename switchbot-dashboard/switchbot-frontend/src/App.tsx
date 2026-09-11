import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { triggerRefresh } from './api/client'
import type { Meter, TimeScale } from './api/types'
import styles from './App.module.css'
import { Controls } from './components/Controls'
import { MeterGrid } from './components/MeterGrid'
import { Navbar } from './components/Navbar'
import shared from './components/shared.module.css'
import { StaleMetersSection } from './components/StaleMetersSection'
import { StatusBar } from './components/StatusBar'
import { useMeters, useStatus } from './hooks/useDashboardData'
import { isStaleMeter } from './utils/meters'

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export default function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const metersQuery = useMeters()
  const statusQuery = useStatus()

  const refreshMutation = useMutation({
    mutationFn: triggerRefresh,
    onError: (err) => setRefreshError(`Failed to refresh: ${errorMessage(err)}`),
    onSuccess: () => setRefreshError(null),
    onSettled: () => queryClient.invalidateQueries(),
  })

  const metersData = metersQuery.data
  const fetchedAt = metersQuery.dataUpdatedAt
  const { activeMeters, staleMeters } = useMemo(() => {
    const active: Meter[] = []
    const stale: Meter[] = []
    for (const m of metersData?.meters ?? []) {
      if (isStaleMeter(m, fetchedAt)) stale.push(m)
      else active.push(m)
    }
    return { activeMeters: active, staleMeters: stale }
  }, [metersData, fetchedAt])

  const isLoading = metersQuery.isPending || statusQuery.isPending
  const fetchError = metersQuery.error
    ? `Failed to fetch meters: ${errorMessage(metersQuery.error)}`
    : statusQuery.error
      ? `Failed to fetch status: ${errorMessage(statusQuery.error)}`
      : null
  const error = fetchError ?? refreshError
  const connected = !metersQuery.isError && !statusQuery.isError && !isLoading
  const lastRefresh = new Date(Math.max(metersQuery.dataUpdatedAt, statusQuery.dataUpdatedAt))

  return (
    <>
      <Navbar connected={connected} />
      <main className={styles.container}>
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => refreshMutation.mutate()}
          refreshing={refreshMutation.isPending}
        />

        {statusQuery.data && <StatusBar status={statusQuery.data} lastRefresh={lastRefresh} />}

        {isLoading && !error && (
          <div id="loading" className={styles.loading}>
            <p>Loading temperature data...</p>
          </div>
        )}

        {error && (
          <div id="error" className={`${shared.alert} ${shared.alertDanger}`}>
            <span>
              <strong>Error.</strong> {error}
            </span>
          </div>
        )}

        <div id="meters-container">
          <MeterGrid meters={activeMeters} timeScale={timeScale} />
          <StaleMetersSection meters={staleMeters} timeScale={timeScale} />
        </div>

        <footer className={styles.footer}>
          Temp Master Dashboard v2.0 - Built with React + Vite + Recharts
        </footer>
      </main>
    </>
  )
}
