import type { Status } from '../types'
import { pad2 } from '../utils'

interface StatusBarProps {
  status: Status | null
  lastRefresh: Date | null
}

export function StatusBar({ status, lastRefresh }: StatusBarProps) {
  if (!status) return null
  const count = status.meters_count || 0
  const noun = count === 1 ? 'meter' : 'meters'
  const refreshText = lastRefresh
    ? `Last refresh: ${pad2(lastRefresh.getHours())}:${pad2(lastRefresh.getMinutes())}:${pad2(lastRefresh.getSeconds())}`
    : ''

  return (
    <>
      <div className="alert alert-info">
        <span>Monitoring {count} {noun}</span>
        <span className="pull-right">{refreshText}</span>
      </div>
      {status.is_rate_limited && (
        <div className="alert alert-warning">
          <strong>Rate Limited.</strong>{' '}
          <span>SwitchBot API rate limit reached. Retry in {status.backoff_remaining || 0} seconds.</span>
        </div>
      )}
    </>
  )
}
