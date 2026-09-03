import type { StatusResponse } from '../types'
import { formatClockTime } from '../utils'

interface StatusBarProps {
  status: StatusResponse | null
  lastRefresh: Date | null
}

export function StatusBar({ status, lastRefresh }: StatusBarProps) {
  if (!status) {
    return null
  }

  const noun = status.meters_count === 1 ? 'meter' : 'meters'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
      <span>
        Monitoring {status.meters_count} {noun}
      </span>
      {lastRefresh && <span>Last refresh: {formatClockTime(lastRefresh)}</span>}
    </div>
  )
}
