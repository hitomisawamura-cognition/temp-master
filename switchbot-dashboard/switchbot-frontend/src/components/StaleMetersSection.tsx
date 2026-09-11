import type { Meter, TimeScale } from '../api/types'
import { MeterGrid } from './MeterGrid'
import shared from './shared.module.css'
import styles from './StaleMetersSection.module.css'

interface StaleMetersSectionProps {
  meters: Meter[]
  timeScale: TimeScale
}

export function StaleMetersSection({ meters, timeScale }: StaleMetersSectionProps) {
  if (meters.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>&#9888; 未更新のメーター</h3>
        <p className={styles.subtitle}>1週間以上更新されていないデバイス</p>
      </div>
      <div className={`${shared.panel} ${styles.panel}`}>
        <div className={shared.panelBody}>
          <MeterGrid meters={meters} timeScale={timeScale} stale />
        </div>
      </div>
    </section>
  )
}
