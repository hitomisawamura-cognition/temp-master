import { MeterCard } from './MeterCard'
import type { MeterDevice, TimeScale } from '../types/api'

interface StaleMetersSectionProps {
  meters: MeterDevice[]
  timeScale: TimeScale
}

export function StaleMetersSection({ meters, timeScale }: StaleMetersSectionProps) {
  if (meters.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-700 dark:text-amber-300">
          <span aria-hidden="true">⚠</span> 未更新のメーター
        </h2>
        <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
          1週間以上更新されていないデバイス
        </p>
      </div>
      <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meters.map((meter) => (
            <MeterCard key={meter.device_id} meter={meter} timeScale={timeScale} stale />
          ))}
        </div>
      </div>
    </section>
  )
}
