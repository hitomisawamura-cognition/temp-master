import { backupUrl } from '../api/client'
import { TIME_SCALES, type TimeScale } from '../api/types'
import styles from './Controls.module.css'
import shared from './shared.module.css'

interface ControlsProps {
  timeScale: TimeScale
  onTimeScaleChange: (scale: TimeScale) => void
  onRefresh: () => void
  refreshing: boolean
}

export function Controls({ timeScale, onTimeScaleChange, onRefresh, refreshing }: ControlsProps) {
  return (
    <div className={shared.panel}>
      <div className={`${shared.panelBody} ${styles.row}`}>
        <div className={styles.group}>
          <label htmlFor="time-scale-select">Time Range:</label>
          <select
            id="time-scale-select"
            className={shared.select}
            value={timeScale}
            onChange={(e) => onTimeScaleChange(e.target.value as TimeScale)}
          >
            {TIME_SCALES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          id="btn-refresh"
          className={`${shared.btn} ${shared.btnPrimary}`}
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
        <button
          type="button"
          id="btn-backup"
          className={shared.btn}
          onClick={() => window.open(backupUrl, '_blank')}
        >
          Download Backup
        </button>
      </div>
    </div>
  )
}
