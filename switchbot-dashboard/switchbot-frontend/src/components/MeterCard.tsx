import { getDisplayName } from '../constants'
import type { MeterDevice, MeterReading, TimeScale } from '../types'
import { TemperatureChart } from './TemperatureChart'

interface MeterCardProps {
  meter: MeterDevice
  history: MeterReading[]
  timeScale: TimeScale
  isStale: boolean
}

function Stat({ value, tone }: { value: string; tone: 'temperature' | 'humidity' | 'battery' }) {
  const tones: Record<typeof tone, string> = {
    temperature: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    humidity: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    battery: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  }

  return (
    <span className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${tones[tone]}`}>{value}</span>
  )
}

export function MeterCard({ meter, history, timeScale, isStale }: MeterCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {getDisplayName(meter.device_name)}
          </h3>
          {isStale && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              7日以上未更新
            </span>
          )}
        </div>
        <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {meter.device_type}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {meter.current_temperature !== null && (
          <Stat value={`${meter.current_temperature}\u00b0C`} tone="temperature" />
        )}
        {meter.current_humidity !== null && (
          <Stat value={`${meter.current_humidity}%`} tone="humidity" />
        )}
        {meter.battery !== null && <Stat value={`${meter.battery}%`} tone="battery" />}
      </div>

      {isStale ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">履歴データの取得対象外</p>
      ) : (
        <TemperatureChart history={history} timeScale={timeScale} />
      )}

      {meter.last_updated ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last updated: {new Date(meter.last_updated).toLocaleString()}
        </p>
      ) : (
        isStale && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            値がありません（データ未受信）
          </p>
        )
      )}
    </article>
  )
}
