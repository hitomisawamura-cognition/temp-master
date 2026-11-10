import { getDisplayName } from '../lib/displayNames'
import { formatDateTime } from '../lib/format'
import { useHistory } from '../lib/queries'
import type { Meter, TimeScale } from '../types'
import { TemperatureChart } from './TemperatureChart'

function Stat({ label, value, unit, color }: { label: string; value: number | null; unit: string; color: string }) {
  if (value === null || value === undefined) return null
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-muted">{label}</span>
      <span className={`font-display text-xl font-semibold tabular-nums ${color}`}>
        {value}
        <span className="ml-0.5 text-sm font-normal">{unit}</span>
      </span>
    </div>
  )
}

function ChartArea({ deviceId, timeScale }: { deviceId: string; timeScale: TimeScale }) {
  const history = useHistory(deviceId, timeScale)
  if (history.isPending) {
    return <div className="h-full animate-pulse rounded-lg bg-surface-muted" aria-label="履歴を読み込み中" />
  }
  if (history.isError) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-surface-muted text-sm text-danger">
        履歴の取得に失敗しました
      </div>
    )
  }
  if (history.data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-surface-muted text-sm text-muted">
        この期間のデータはありません
      </div>
    )
  }
  return <TemperatureChart id={deviceId} data={history.data} timeScale={timeScale} />
}

export function MeterCard({ meter, timeScale, stale = false }: { meter: Meter; timeScale: TimeScale; stale?: boolean }) {
  return (
    <article
      data-testid="meter-card"
      className={`flex flex-col rounded-xl border bg-surface p-4 shadow-sm transition-colors ${
        stale ? 'border-warn/40' : 'border-border'
      }`}
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold" title={meter.device_name}>
            {getDisplayName(meter.device_name)}
          </h3>
          {stale && (
            <span className="mt-1 inline-block rounded-full bg-warn-bg px-2 py-0.5 text-[11px] font-medium text-warn">
              7日以上未更新
            </span>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-muted">{meter.device_type}</span>
      </header>

      <div className="mb-3 flex gap-6">
        <Stat label="温度" value={meter.current_temperature} unit="°C" color="text-temp" />
        <Stat label="湿度" value={meter.current_humidity} unit="%" color="text-humidity" />
        <Stat label="電池" value={meter.battery} unit="%" color="text-battery" />
      </div>

      {stale ? (
        <p className="text-sm text-warn">履歴データの取得対象外</p>
      ) : (
        <div className="h-48">
          <ChartArea deviceId={meter.device_id} timeScale={timeScale} />
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        {meter.last_updated ? `最終更新: ${formatDateTime(meter.last_updated)}` : '値がありません（データ未受信）'}
      </p>
    </article>
  )
}
