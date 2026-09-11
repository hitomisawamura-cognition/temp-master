import type { StatusResponse } from '../api/types'
import { formatClock } from '../utils/meters'
import shared from './shared.module.css'

interface StatusBarProps {
  status: StatusResponse
  lastRefresh: Date
}

export function StatusBar({ status, lastRefresh }: StatusBarProps) {
  const count = status.meters_count ?? 0
  const noun = count === 1 ? 'meter' : 'meters'

  return (
    <>
      <div id="status-bar" className={`${shared.alert} ${shared.alertInfo}`}>
        <span>
          Monitoring {count} {noun}
        </span>
        <span>Last refresh: {formatClock(lastRefresh)}</span>
      </div>
      {status.is_rate_limited && (
        <div id="rate-limit-warning" className={`${shared.alert} ${shared.alertWarning}`}>
          <span>
            <strong>Rate Limited.</strong> SwitchBot API rate limit reached. Retry in{' '}
            {status.backoff_remaining ?? 0} seconds.
          </span>
        </div>
      )}
    </>
  )
}
