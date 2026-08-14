import type { TimeScale } from '../api/types';

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
  onRefresh: () => void;
  onDownloadBackup: () => void;
  isRefreshing: boolean;
}

export function Controls({
  timeScale,
  onTimeScaleChange,
  onRefresh,
  onDownloadBackup,
  isRefreshing,
}: ControlsProps) {
  return (
    <div className="mb-4 rounded border border-border bg-panel p-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-text" htmlFor="time-scale-select">
          Time Range:
          <select
            id="time-scale-select"
            className="rounded border border-border bg-panel px-2 py-1 text-sm text-text"
            value={timeScale}
            onChange={(event) => onTimeScaleChange(event.target.value as TimeScale)}
          >
            {TIME_SCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-text disabled:opacity-60"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
        <button
          type="button"
          className="rounded border border-border bg-panel-header px-3 py-1.5 text-sm font-medium text-text"
          onClick={onDownloadBackup}
        >
          Download Backup
        </button>
      </div>
    </div>
  );
}
