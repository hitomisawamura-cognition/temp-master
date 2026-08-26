import type { Meter } from '../api/client'
import MeterCard from './MeterCard'

interface StaleMetersSectionProps {
  meters: Meter[]
}

export default function StaleMetersSection({ meters }: StaleMetersSectionProps) {
  if (meters.length === 0) {
    return null
  }

  return (
    <section className="stale-section">
      <header className="stale-section-header">
        <h3 className="stale-section-title">&#9888; 未更新のメーター</h3>
        <p className="stale-section-subtitle">1週間以上更新されていないデバイス</p>
      </header>
      <div className="stale-section-body">
        <div className="meter-grid">
          {meters.map((meter) => (
            <MeterCard key={meter.device_id} meter={meter} isStale />
          ))}
        </div>
      </div>
    </section>
  )
}
