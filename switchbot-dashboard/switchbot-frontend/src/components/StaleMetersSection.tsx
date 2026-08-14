import type { Meter, TimeScale } from '../api/types'
import { MeterCard } from './MeterCard'

interface Props {
  meters: Meter[]
  timeScale: TimeScale
}

export function StaleMetersSection({ meters, timeScale }: Props) {
  return (
    <section className="section">
      <div className="section-header">
        <h3 className="section-title">
          <span aria-hidden="true">⚠</span> 未更新のメーター
        </h3>
        <p className="section-subtitle">1週間以上更新されていないデバイス</p>
      </div>
      <div className="stale-panel">
        <div className="meter-grid">
          {meters.map((meter) => (
            <MeterCard
              key={meter.device_id}
              meter={meter}
              timeScale={timeScale}
              isStale
            />
          ))}
        </div>
      </div>
    </section>
  )
}
