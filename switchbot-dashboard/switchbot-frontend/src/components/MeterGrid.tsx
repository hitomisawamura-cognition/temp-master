import type { MeterDevice, TimeScale } from '../api/types'
import { MeterCard } from './MeterCard'
import styles from './MeterGrid.module.css'

interface MeterGridProps {
  meters: MeterDevice[]
  timeScale: TimeScale
  stale?: boolean
  refreshToken: unknown
}

export function MeterGrid({ meters, timeScale, stale = false, refreshToken }: MeterGridProps) {
  if (!meters.length) {
    return null
  }

  return (
    <div className={styles.grid}>
      {meters.map((meter) => (
        <MeterCard
          key={meter.device_id}
          meter={meter}
          timeScale={timeScale}
          stale={stale}
          refreshToken={refreshToken}
        />
      ))}
    </div>
  )
}
