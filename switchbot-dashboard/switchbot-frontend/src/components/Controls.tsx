import { TIME_SCALE_OPTIONS } from '../constants';
import type { TimeScale } from '../types';

interface ControlsProps {
  timeScale: TimeScale;
  onTimeScaleChange: (timeScale: TimeScale) => void;
  onRefresh: () => void;
  onBackup: () => void;
  refreshing: boolean;
}

/** 時間スケール選択と各種操作ボタン */
export function Controls({
  timeScale,
  onTimeScaleChange,
  onRefresh,
  onBackup,
  refreshing,
}: ControlsProps) {
  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <label htmlFor="time-scale-select" className="text-sm font-medium">
        Time Range:
      </label>
      <select
        id="time-scale-select"
        value={timeScale}
        onChange={(event) => onTimeScaleChange(event.target.value as TimeScale)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {TIME_SCALE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {refreshing ? 'Refreshing...' : 'Refresh Data'}
      </button>
      <button
        type="button"
        onClick={onBackup}
        className="rounded-lg border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-content transition-colors hover:bg-border/60"
      >
        Download Backup
      </button>
    </section>
  );
}
