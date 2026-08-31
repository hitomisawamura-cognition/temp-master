import { useMemo, useState } from 'react'
import { backupUrl } from './api/client'
import type { TimeScale } from './api/types'
import { ControlPanel } from './components/ControlPanel'
import { MeterGrid } from './components/MeterGrid'
import { Navbar } from './components/Navbar'
import { StaleMetersSection } from './components/StaleMetersSection'
import { StatusBar } from './components/StatusBar'
import { useDashboardData } from './hooks/useDashboardData'
import { splitMetersByStaleness } from './utils/staleMeter'
import styles from './App.module.css'

export function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const { meters, status, lastRefreshedAt, loading, error, refreshing, refresh } =
    useDashboardData()

  const { activeMeters, staleMeters } = useMemo(
    () => splitMetersByStaleness(meters),
    [meters],
  )

  const handleDownloadBackup = () => {
    window.open(backupUrl(), '_blank')
  }

  return (
    <>
      <Navbar connected={!error} />
      <div className={styles.container}>
        <ControlPanel
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => void refresh()}
          onDownloadBackup={handleDownloadBackup}
          refreshing={refreshing}
        />
        <StatusBar status={status} lastRefreshedAt={lastRefreshedAt} />
        {loading && (
          <div className={styles.loading}>
            <p className={styles.loadingText}>Loading temperature data...</p>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            <strong>Error.</strong> <span>{error}</span>
          </div>
        )}
        <MeterGrid
          meters={activeMeters}
          timeScale={timeScale}
          refreshToken={lastRefreshedAt?.getTime()}
        />
        <StaleMetersSection
          meters={staleMeters}
          timeScale={timeScale}
          refreshToken={lastRefreshedAt?.getTime()}
        />
        <footer className={styles.footer}>
          Temp Master Dashboard v1.0 - Built with React + Vite + TypeScript
        </footer>
      </div>
    </>
  )
}
