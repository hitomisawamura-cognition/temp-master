import type { Meter, TimeScale } from '../api/types'
import styles from './MeterGrid.module.css'
import { MeterPanel } from './MeterPanel'

interface MeterGridProps {
  meters: Meter[]
  timeScale: TimeScale
  stale?: boolean
}

export function MeterGrid({ meters, timeScale, stale = false }: MeterGridProps) {
  if (meters.length === 0) return null

  return (
    <div className={styles.grid}>
      {meters.map((meter) => (
        <MeterPanel key={meter.device_id} meter={meter} timeScale={timeScale} stale={stale} />
      ))}
    </div>
  )
}
