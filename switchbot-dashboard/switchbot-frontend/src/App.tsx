import { useState } from 'react'
import { Controls } from './components/Controls'
import { Header, type ConnectionState } from './components/Header'
import { MeterCard } from './components/MeterCard'
import { StaleMetersSection } from './components/StaleMetersSection'
import { StatusBar } from './components/StatusBar'
import { api } from './lib/api'
import { partitionMeters } from './lib/format'
import { useMeters, useRefreshMeters, useStatus } from './lib/queries'
import type { TimeScale } from './types'

export default function App() {
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const meters = useMeters()
  const status = useStatus()
  const refresh = useRefreshMeters()

  const connection: ConnectionState = meters.isError || status.isError
    ? 'disconnected'
    : meters.isSuccess
      ? 'connected'
      : 'connecting'

  const { active, stale } = partitionMeters(meters.data?.meters ?? [])
  const error = meters.error ?? status.error ?? refresh.error

  return (
    <div className="min-h-screen">
      <Header connection={connection} />
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-6">
        <Controls
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          onRefresh={() => refresh.mutate()}
          refreshing={refresh.isPending}
          backupUrl={api.backupUrl()}
        />

        {status.data && <StatusBar status={status.data} lastFetchedAt={meters.dataUpdatedAt} />}

        {error && (
          <div role="alert" className="rounded-xl border border-danger/40 px-4 py-2 text-sm text-danger">
            <strong>エラー:</strong> {error.message}
          </div>
        )}

        {meters.isPending ? (
          <p className="py-10 text-center text-muted">温度データを読み込み中…</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((m) => (
                <MeterCard key={m.device_id} meter={m} timeScale={timeScale} />
              ))}
            </div>
            {stale.length > 0 && <StaleMetersSection meters={stale} timeScale={timeScale} />}
          </>
        )}
      </main>
      <footer className="py-6 text-center text-xs text-muted">
        Temp Master Dashboard v2.0 - Built with React + Vite
      </footer>
    </div>
  )
}
