import { getDisplayName } from '../lib/constants'
import { useHistoryQuery } from '../hooks/useDashboardData'
import { TemperatureChart } from './TemperatureChart'
import type { MeterDevice, TimeScale } from '../types/api'

interface MeterCardProps {
  meter: MeterDevice
  timeScale: TimeScale
  stale: boolean
}

function Stat({ value, tone }: { value: string; tone: 'temperature' | 'humidity' | 'battery' }) {
  const tones = {
    temperature:
      'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    humidity: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    battery: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  }
  return (
    <span className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${tones[tone]}`}>{value}</span>
  )
}

export function MeterCard({ meter, timeScale, stale }: MeterCardProps) {
  const { data } = useHistoryQuery(meter.device_id, timeScale, !stale)
  const history = data?.history ?? []

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            {getDisplayName(meter.device_name)}
          </h2>
          {stale && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              7日以上未更新
            </span>
          )}
        </div>
        <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {meter.device_type}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {meter.current_temperature !== null && (
            <Stat value={`${meter.current_temperature}\u00b0C`} tone="temperature" />
          )}
          {meter.current_humidity !== null && (
            <Stat value={`${meter.current_humidity}%`} tone="humidity" />
          )}
          {meter.battery !== null && <Stat value={`${meter.battery}%`} tone="battery" />}
        </div>
        {stale ? (
          <p className="text-sm text-amber-800 dark:text-amber-300">履歴データの取得対象外</p>
        ) : (
          <TemperatureChart history={history} timeScale={timeScale} />
        )}
        {meter.last_updated ? (
          <p className="mt-auto text-xs text-slate-500 dark:text-slate-400">
            {`Last updated: ${new Date(meter.last_updated).toLocaleString()}`}
          </p>
        ) : (
          stale && (
            <p className="mt-auto text-xs text-amber-800 dark:text-amber-300">
              値がありません（データ未受信）
            </p>
          )
        )}
      </div>
    </article>
  )
}
