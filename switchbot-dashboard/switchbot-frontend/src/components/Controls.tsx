import type { TimeScale } from '../api';

interface ControlsProps {
  timeScale: TimeScale;
  isRefreshing: boolean;
  onTimeScaleChange: (timeScale: TimeScale) => void;
  onRefresh: () => void;
  onBackup: () => void;
}

const timeScaleOptions: Array<{ value: TimeScale; label: string }> = [
  { value: 'hour', label: 'Last Hour' },
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last Year' },
];

export function Controls({
  timeScale,
  isRefreshing,
  onTimeScaleChange,
  onRefresh,
  onBackup,
}: ControlsProps) {
  return (
    <section className="panel controls-panel">
      <div className="controls">
        <label htmlFor="time-scale-select">Time Range:</label>
        <select
          id="time-scale-select"
          value={timeScale}
          onChange={(event) => onTimeScaleChange(event.target.value as TimeScale)}
        >
          {timeScaleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="button button-primary" type="button" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
        <button className="button button-secondary" type="button" onClick={onBackup}>
          Download Backup
        </button>
      </div>
    </section>
  );
}
