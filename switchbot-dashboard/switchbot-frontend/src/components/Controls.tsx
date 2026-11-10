import { TIME_SCALE_OPTIONS } from '../lib/format'
import type { TimeScale } from '../types'

interface Props {
  timeScale: TimeScale
  onTimeScaleChange: (value: TimeScale) => void
  onRefresh: () => void
  refreshing: boolean
  backupUrl: string
}

export function Controls({ timeScale, onTimeScaleChange, onRefresh, refreshing, backupUrl }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">表示期間</span>
        <select
          value={timeScale}
          onChange={(e) => onTimeScaleChange(e.target.value as TimeScale)}
          className="rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-sm text-fg focus:outline-2 focus:outline-accent"
        >
          {TIME_SCALE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {refreshing ? '更新中…' : 'データを更新'}
        </button>
        <a
          href={backupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-fg hover:bg-surface-muted"
        >
          バックアップをダウンロード
        </a>
      </div>
    </div>
  )
}
