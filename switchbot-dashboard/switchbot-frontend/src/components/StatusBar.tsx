import { formatClockTime } from '../lib/format'
import type { StatusResponse } from '../types/api'

interface StatusBarProps {
  status: StatusResponse | undefined
  lastRefresh: Date | null
}

export function StatusBar({ status, lastRefresh }: StatusBarProps) {
  if (!status) {
    return null
  }

  const count = status.meters_count
  const noun = count === 1 ? 'meter' : 'meters'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
        <span>{`Monitoring ${count} ${noun}`}</span>
        {lastRefresh && <span>{`Last refresh: ${formatClockTime(lastRefresh)}`}</span>}
      </div>
      {status.is_rate_limited && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <strong className="font-semibold">Rate Limited.</strong>{' '}
          {`SwitchBot API rate limit reached. Retry in ${status.backoff_remaining} seconds.`}
        </div>
      )}
    </div>
  )
}
