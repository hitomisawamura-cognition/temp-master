import { useCallback, useEffect, useState } from 'react'
import {
  backupUrl,
  fetchMeters,
  fetchStatus,
  triggerRefresh,
  type Meter,
  type StatusResponse,
  type TimeScale,
} from './api/client'
import MeterCard from './components/MeterCard'
import MeterChart from './components/MeterChart'
import StaleMetersSection from './components/StaleMetersSection'
import ThemeToggle from './components/ThemeToggle'
import { formatClockTime, isStaleMeter } from './utils/meters'

const REFRESH_INTERVAL = 30000

const TIME_SCALE_OPTIONS: { value: TimeScale; label: string }[] = [
  { value: 'hour', label: 'Last Hour' },
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last Year' },
]

export default function App() {
  const [meters, setMeters] = useState<Meter[]>([])
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const metersResponse = await fetchMeters()
      const statusResponse = await fetchStatus()
      setMeters(metersResponse.meters)
      setStatus(statusResponse)
      setError(null)
      setLastRefresh(new Date())
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
    const timer = window.setInterval(() => {
      void loadData()
    }, REFRESH_INTERVAL)
    return () => window.clearInterval(timer)
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

  const handleBackup = () => {
    window.open(backupUrl(), '_blank')
  }

  const activeMeters = meters.filter((meter) => !isStaleMeter(meter))
  const staleMeters = meters.filter((meter) => isStaleMeter(meter))
  const metersCount = status?.meters_count ?? 0

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="navbar-brand">Temp Master Dashboard</span>
          <div className="navbar-right">
            <span className={`badge ${error ? 'badge-danger' : 'badge-success'}`}>
              {error ? 'Disconnected' : 'Connected'}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="card controls">
          <div className="card-body controls-body">
            <label className="control-label" htmlFor="time-scale-select">
              Time Range:
            </label>
            <select
              id="time-scale-select"
              className="select"
              value={timeScale}
              onChange={(event) => setTimeScale(event.target.value as TimeScale)}
            >
              {TIME_SCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button type="button" className="btn" onClick={handleBackup}>
              Download Backup
            </button>
          </div>
        </div>

        {status && (
          <div className="alert alert-info status-bar">
            <span>
              Monitoring {metersCount} {metersCount === 1 ? 'meter' : 'meters'}
            </span>
            {lastRefresh && <span>Last refresh: {formatClockTime(lastRefresh)}</span>}
          </div>
        )}

        {status?.is_rate_limited && (
          <div className="alert alert-warning">
            <strong>Rate Limited.</strong> SwitchBot API rate limit reached. Retry in{' '}
            {status.backoff_remaining} seconds.
          </div>
        )}

        {loading && <p className="loading">Loading temperature data...</p>}

        {error && (
          <div className="alert alert-danger">
            <strong>Error.</strong> {error}
          </div>
        )}

        {activeMeters.length > 0 && (
          <div className="meter-grid">
            {activeMeters.map((meter) => (
              <MeterCard key={meter.device_id} meter={meter}>
                <MeterChart
                  deviceId={meter.device_id}
                  timeScale={timeScale}
                  refreshKey={refreshKey}
                />
              </MeterCard>
            ))}
          </div>
        )}

        <StaleMetersSection meters={staleMeters} />

        <footer className="footer">
          Temp Master Dashboard v1.0 - Built with React + TypeScript + Vite
        </footer>
      </main>
    </>
  )
}
