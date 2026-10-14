import type { StatusResponse } from '../api/types';
import { formatClock } from '../lib/meters';
import styles from './StatusBar.module.css';
import ui from './ui.module.css';

interface StatusBarProps {
  status: StatusResponse | null;
  lastRefresh: Date | null;
}

export function StatusBar({ status, lastRefresh }: StatusBarProps) {
  if (!status) {
    return null;
  }

  const count = status.meters_count || 0;
  const noun = count === 1 ? 'meter' : 'meters';

  return (
    <>
      <div data-testid="status-bar" className={`${ui.alert} ${ui.alertInfo} ${styles.bar}`}>
        <span>
          Monitoring {count} {noun}
        </span>
        {lastRefresh && <span>Last refresh: {formatClock(lastRefresh)}</span>}
      </div>
      {status.is_rate_limited && (
        <div data-testid="rate-limit-warning" className={`${ui.alert} ${ui.alertWarning}`}>
          <strong>Rate Limited.</strong> SwitchBot API rate limit reached. Retry in {status.backoff_remaining || 0}{' '}
          seconds.
        </div>
      )}
    </>
  );
}
