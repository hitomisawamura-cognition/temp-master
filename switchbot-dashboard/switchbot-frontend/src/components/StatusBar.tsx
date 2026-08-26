import type { Status } from '../api';
import { pad2 } from '../lib/format';

interface StatusBarProps {
  status: Status | null;
}

export function StatusBar({ status }: StatusBarProps) {
  if (!status) {
    return null;
  }

  const count = status.meters_count || 0;
  const now = new Date();
  const refreshTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

  return (
    <>
      <div className="alert alert-info status-bar">
        <span>Monitoring {count} {count === 1 ? 'meter' : 'meters'}</span>
        <span>Last refresh: {refreshTime}</span>
      </div>
      {status.is_rate_limited && (
        <div className="alert alert-warning">
          <strong>Rate Limited.</strong>{' '}
          SwitchBot API rate limit reached. Retry in {status.backoff_remaining || 0} seconds.
        </div>
      )}
    </>
  );
}
