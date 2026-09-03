import { useCallback, useEffect, useState } from 'react'
import { backupUrl, fetchHistory, fetchMeters, fetchStatus, triggerRefresh } from './api'
import { ErrorAlert, RateLimitWarning } from './components/Alerts'
import { Controls } from './components/Controls'
import { MeterCard } from './components/MeterCard'
import { NavBar } from './components/NavBar'
import { StatusBar } from './components/StatusBar'
import { REFRESH_INTERVAL } from './constants'
import type { MeterDevice, MeterReading, StatusResponse, TimeScale } from './types'
import { isStaleMeter } from './utils'

export default function App() {
  const [meters, setMeters] = useState<MeterDevice[]>([])
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [histories, setHistories] = useState<Record<string, MeterReading[]>>({})
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const loadHistories = useCallback(async (deviceIds: string[], scale: TimeScale) => {
    const results = await Promise.all(
      deviceIds.map(async (deviceId) => {
        try {
          const response = await fetchHistory(deviceId, scale)
          return [deviceId, response.history] as const
        } catch {
          return [deviceId, []] as const
        }
      }),
    )
    setHistories(Object.fromEntries(results))
  }, [])

  const loadData = useCallback(async () => {
    try {
      const [metersResponse, statusResponse] = await Promise.all([fetchMeters(), fetchStatus()])
      setMeters(metersResponse.meters)
      setStatus(statusResponse)
      setError(null)
      setLastRefresh(new Date())
      setLoading(false)

      const activeIds = metersResponse.meters
        .filter((meter) => !isStaleMeter(meter))
        .map((meter) => meter.device_id)
      await loadHistories(activeIds, timeScale)
    } catch (err) {
      setLoading(false)
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [loadHistories, timeScale])

  useEffect(() => {
    void loadData()
    const interval = setInterval(() => {
      void loadData()
    }, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await triggerRefresh()
    } catch (err) {
      setError(`Failed to refresh: ${err instanceof Error ? err.message : String(err)}`)
    }
    await loadData()
    setRefreshing(false)
  }

  const activeMeters = meters.filter((meter) => !isStaleMeter(meter))
  const staleMeters = meters.filter((meter) => isStaleMeter(meter))

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <NavBar connected={error === null} />

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6">
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => void handleRefresh()}
          onBackup={() => window.open(backupUrl(), '_blank')}
          refreshing={refreshing}
        />

        <StatusBar status={status} lastRefresh={lastRefresh} />

        {status?.is_rate_limited && (
          <RateLimitWarning backoffRemaining={status.backoff_remaining} />
        )}

        {error && <ErrorAlert message={error} />}

        {loading ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">
            Loading temperature data...
          </p>
        ) : (
          <>
            {activeMeters.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeMeters.map((meter) => (
                  <MeterCard
                    key={meter.device_id}
                    meter={meter}
                    history={histories[meter.device_id] ?? []}
                    timeScale={timeScale}
                    isStale={false}
                  />
                ))}
              </div>
            )}

            {staleMeters.length > 0 && (
              <section className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
                <div>
                  <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    未更新のメーター
                  </h2>
                  <p className="text-xs text-amber-700 dark:text-amber-300/80">
                    1週間以上更新されていないデバイス
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {staleMeters.map((meter) => (
                    <MeterCard
                      key={meter.device_id}
                      meter={meter}
                      history={[]}
                      timeScale={timeScale}
                      isStale
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Temp Master Dashboard v2.0 - Built with React + Vite + Tailwind CSS
        </footer>
      </main>
    </div>
  )
}
