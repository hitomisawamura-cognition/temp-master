import type { Meter, TimeScale } from '../types'
import { MeterCard } from './MeterCard'

export function StaleMetersSection({ meters, timeScale }: { meters: Meter[]; timeScale: TimeScale }) {
  return (
    <section aria-labelledby="stale-meters-title" className="rounded-xl border border-warn/40 bg-warn-bg p-4">
      <h2 id="stale-meters-title" className="font-semibold text-warn">
        未更新のメーター
      </h2>
      <p className="mb-4 text-xs text-warn">1週間以上更新されていないデバイス</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meters.map((m) => (
          <MeterCard key={m.device_id} meter={m} timeScale={timeScale} stale />
        ))}
      </div>
    </section>
  )
}
