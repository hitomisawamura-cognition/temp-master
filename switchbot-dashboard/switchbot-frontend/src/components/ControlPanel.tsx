import type { TimeScale } from '../api/types'
import { TIME_SCALE_OPTIONS } from '../constants'
import styles from './ControlPanel.module.css'

interface ControlPanelProps {
  timeScale: TimeScale
  onTimeScaleChange: (timeScale: TimeScale) => void
  onRefresh: () => void
  onDownloadBackup: () => void
  refreshing: boolean
}

export function ControlPanel({
  timeScale,
  onTimeScaleChange,
  onRefresh,
  onDownloadBackup,
  refreshing,
}: ControlPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.field}>
          <label htmlFor="time-scale-select">Time Range:</label>
          <select
            id="time-scale-select"
            className={styles.select}
            value={timeScale}
            onChange={(event) => onTimeScaleChange(event.target.value as TimeScale)}
          >
            {TIME_SCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
        <button type="button" className={styles.button} onClick={onDownloadBackup}>
          Download Backup
        </button>
      </div>
    </div>
  )
}
