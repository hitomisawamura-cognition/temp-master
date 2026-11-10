import type { StatusResponse } from '@/api/types';
import { Alert } from '@/components/ui/alert';
import { formatClock } from '@/lib/format';

interface StatusBarProps {
  status: StatusResponse | undefined;
  lastRefresh: Date | null;
}

export function StatusBar({ status, lastRefresh }: StatusBarProps) {
  if (!status) return null;

  const count = status.meters_count || 0;
  return (
    <div className="space-y-3">
      <Alert variant="info" data-testid="status-bar" className="justify-between">
        <span>
          Monitoring {count} {count === 1 ? 'meter' : 'meters'}
        </span>
        {lastRefresh && <span className="text-muted-foreground">Last refresh: {formatClock(lastRefresh)}</span>}
      </Alert>
      {status.is_rate_limited && (
        <Alert variant="warning" data-testid="rate-limit-warning">
          <strong>Rate Limited.</strong>
          <span>SwitchBot API rate limit reached. Retry in {status.backoff_remaining || 0} seconds.</span>
        </Alert>
      )}
    </div>
  );
}
