import { useCallback, useEffect, useState } from 'react'
import { fetchMeters, fetchStatus, triggerRefresh } from './api'
import { Controls } from './components/Controls'
import { Footer } from './components/Footer'
import { MeterPanel } from './components/MeterPanel'
import { Navbar } from './components/Navbar'
import { StaleMetersSection } from './components/StaleMetersSection'
import { StatusBar } from './components/StatusBar'
import { REFRESH_INTERVAL } from './config'
import type { Meter, Status, TimeScale } from './types'
import { isStaleMeter } from './utils'

export default function App() {
  const [meters, setMeters] = useState<Meter[]>([])
  const [status, setStatus] = useState<Status | null>(null)
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const [metersResponse, statusResponse] = await Promise.all([fetchMeters(), fetchStatus()])
      setMeters(metersResponse.meters ?? [])
      setStatus(statusResponse)
      setConnected(true)
      setError(null)
      setLastRefresh(new Date())
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason)
      setError(message)
      setConnected(false)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData(true)
    const interval = window.setInterval(() => void loadData(), REFRESH_INTERVAL)
    return () => window.clearInterval(interval)
  }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    let refreshError: string | null = null
    try {
      await triggerRefresh()
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason)
      refreshError = `Failed to refresh: ${message}`
      setError(refreshError)
      setConnected(false)
    } finally {
      await loadData()
      if (refreshError) {
        setError(refreshError)
        setConnected(false)
      }
      setRefreshing(false)
    }
  }

  const activeMeters = meters.filter((meter) => !isStaleMeter(meter))
  const staleMeters = meters.filter((meter) => isStaleMeter(meter))

  return (
    <>
      <Navbar connected={connected} />
      <div className="container-fluid">
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <StatusBar status={status} lastRefresh={lastRefresh} />
        {loading && (
          <div id="loading">
            <p className="text-muted">Loading temperature data...</p>
          </div>
        )}
        {error && (
          <div className="alert alert-danger">
            <strong>Error.</strong> {error}
          </div>
        )}
        {!loading && (
          <div id="meters-container">
            {activeMeters.length > 0 && (
              <div className="row">
                {activeMeters.map((meter) => (
                  <div className="col-md-4 col-sm-6" key={meter.device_id}>
                    <MeterPanel meter={meter} stale={false} timeScale={timeScale} />
                  </div>
                ))}
              </div>
            )}
            <StaleMetersSection meters={staleMeters} timeScale={timeScale} />
          </div>
        )}
        <Footer />
      </div>
    </>
  )
}
