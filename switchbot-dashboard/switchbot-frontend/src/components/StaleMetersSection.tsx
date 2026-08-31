import type { MeterDevice, TimeScale } from '../api/types'
import { MeterGrid } from './MeterGrid'
import styles from './StaleMetersSection.module.css'

interface StaleMetersSectionProps {
  meters: MeterDevice[]
  timeScale: TimeScale
  refreshToken: unknown
}

export function StaleMetersSection({ meters, timeScale, refreshToken }: StaleMetersSectionProps) {
  if (!meters.length) {
    return null
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span aria-hidden="true">⚠</span> 未更新のメーター
        </h3>
        <p className={styles.subtitle}>
          1週間以上更新されていないデバイス
        </p>
      </div>
      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <MeterGrid meters={meters} timeScale={timeScale} stale refreshToken={refreshToken} />
        </div>
      </div>
    </div>
  )
}
