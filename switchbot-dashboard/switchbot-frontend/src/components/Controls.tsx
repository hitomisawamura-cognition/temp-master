import type { TimeScale } from '../api/types'
import { TIME_SCALE_OPTIONS } from '../constants'

interface ControlsProps {
  timeScale: TimeScale
  onTimeScaleChange: (timeScale: TimeScale) => void
  onRefresh: () => void
  onDownloadBackup: () => void
  refreshing: boolean
}

export function Controls({
  timeScale,
  onTimeScaleChange,
  onRefresh,
  onDownloadBackup,
  refreshing,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded border border-border bg-panel p-4">
      <label className="flex items-center gap-2 text-sm" htmlFor="time-scale-select">
        <span>Time Range:</span>
        <select
          id="time-scale-select"
          className="rounded border border-border bg-panel px-2 py-1 text-sm text-fg"
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
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-60"
        onClick={onRefresh}
        disabled={refreshing}
      >
        {refreshing ? 'Refreshing...' : 'Refresh Data'}
      </button>

      <button
        type="button"
        className="rounded border border-border bg-panel-header px-3 py-1.5 text-sm font-medium text-fg"
        onClick={onDownloadBackup}
      >
        Download Backup
      </button>
    </div>
  )
}
