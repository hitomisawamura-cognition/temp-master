import type { TimeScale } from '../api/types';
import styles from './Controls.module.css';
import ui from './ui.module.css';

const TIME_SCALE_OPTIONS: { value: TimeScale; label: string }[] = [
  { value: 'hour', label: 'Last Hour' },
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last Year' },
];

interface ControlsProps {
  timeScale: TimeScale;
  onTimeScaleChange: (timeScale: TimeScale) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onBackup: () => void;
}

export function Controls({ timeScale, onTimeScaleChange, refreshing, onRefresh, onBackup }: ControlsProps) {
  return (
    <div className={ui.panel}>
      <div className={ui.panelBody}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.field}>
            <label htmlFor="time-scale-select" className={styles.fieldLabel}>
              Time Range:
            </label>
            <select
              id="time-scale-select"
              className={ui.formControl}
              value={timeScale}
              onChange={(e) => onTimeScaleChange(e.target.value as TimeScale)}
            >
              {TIME_SCALE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className={`${ui.btn} ${ui.btnPrimary}`} disabled={refreshing} onClick={onRefresh}>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnDefault}`} onClick={onBackup}>
            Download Backup
          </button>
        </form>
      </div>
    </div>
  );
}
