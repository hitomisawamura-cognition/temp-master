import { TIME_SCALE_OPTIONS } from '../lib/constants'
import type { TimeScale } from '../types/api'

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
    <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <label htmlFor="time-scale-select" className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Time Range
      </label>
      <select
        id="time-scale-select"
        value={timeScale}
        onChange={(event) => onTimeScaleChange(event.target.value as TimeScale)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        {TIME_SCALE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="ml-auto flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
        <button
          type="button"
          onClick={onDownloadBackup}
          className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Download Backup
        </button>
      </div>
    </section>
  )
}
