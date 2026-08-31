import type { StatusResponse } from '../api/types'
import { formatClockTime } from '../utils/format'
import styles from './StatusBar.module.css'

interface StatusBarProps {
  status: StatusResponse | null
  lastRefreshedAt: Date | null
}

export function StatusBar({ status, lastRefreshedAt }: StatusBarProps) {
  if (!status) {
    return null
  }

  const count = status.meters_count || 0
  const noun = count === 1 ? 'meter' : 'meters'

  return (
    <>
      <div className={styles.statusBar}>
        <span>{`Monitoring ${count} ${noun}`}</span>
        {lastRefreshedAt && <span>{`Last refresh: ${formatClockTime(lastRefreshedAt)}`}</span>}
      </div>
      {status.is_rate_limited && (
        <div className={styles.rateLimit}>
          <strong>Rate Limited.</strong>{' '}
          <span>
            {`SwitchBot API rate limit reached. Retry in ${status.backoff_remaining || 0} seconds.`}
          </span>
        </div>
      )}
    </>
  )
}
