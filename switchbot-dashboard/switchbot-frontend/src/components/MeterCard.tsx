import { useHistory } from '../api/hooks'
import type { MeterDevice, TimeScale } from '../api/types'
import { getDisplayName } from '../constants'
import { TemperatureChart } from './TemperatureChart'

interface MeterCardProps {
  meter: MeterDevice
  timeScale: TimeScale
  stale: boolean
}

function Stat({ value, className }: { value: string; className: string }) {
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${className}`}>{value}</span>
}

export function MeterCard({ meter, timeScale, stale }: MeterCardProps) {
  const { data } = useHistory(meter.device_id, timeScale, !stale)

  return (
    <div className="flex flex-col rounded border border-border bg-panel">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-panel-header px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm">{getDisplayName(meter.device_name)}</strong>
          {stale && (
            <span className="rounded bg-warning px-2 py-0.5 text-[11px] font-semibold text-accent-fg">
              7日以上未更新
            </span>
          )}
        </div>
        <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] text-muted">
          {meter.device_type}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap gap-2">
          {meter.current_temperature !== null && (
            <Stat value={`${meter.current_temperature}\u00b0C`} className="bg-danger text-accent-fg" />
          )}
          {meter.current_humidity !== null && (
            <Stat value={`${meter.current_humidity}%`} className="bg-info text-accent-fg" />
          )}
          {meter.battery !== null && (
            <Stat value={`${meter.battery}%`} className="bg-success text-accent-fg" />
          )}
        </div>

        {stale ? (
          <p className="text-xs text-warning-fg">履歴データの取得対象外</p>
        ) : (
          <TemperatureChart history={data?.history ?? []} timeScale={timeScale} />
        )}

        {meter.last_updated ? (
          <p className="mt-auto text-[12px] text-muted">
            {`Last updated: ${new Date(meter.last_updated).toLocaleString()}`}
          </p>
        ) : (
          stale && <p className="mt-auto text-xs text-warning-fg">値がありません（データ未受信）</p>
        )}
      </div>
    </div>
  )
}
