import type { MeterDevice, TimeScale } from '../api/types'
import { MeterCard } from './MeterCard'

interface StaleMetersSectionProps {
  meters: MeterDevice[]
  timeScale: TimeScale
}

export function StaleMetersSection({ meters, timeScale }: StaleMetersSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-warning-fg">⚠ 未更新のメーター</h2>
        <p className="mt-1 text-xs text-warning-fg">1週間以上更新されていないデバイス</p>
      </div>
      <div className="rounded border border-warning bg-warning-bg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meters.map((meter) => (
            <MeterCard key={meter.device_id} meter={meter} timeScale={timeScale} stale />
          ))}
        </div>
      </div>
    </section>
  )
}
