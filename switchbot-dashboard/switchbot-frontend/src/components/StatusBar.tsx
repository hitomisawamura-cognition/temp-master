import { formatClock } from '../utils/format';
import type { StatusResponse } from '../types';

interface StatusBarProps {
  status: StatusResponse | null;
  lastRefresh: Date | null;
}

/** メーター数と最終更新時刻を表示するステータスバー */
export function StatusBar({ status, lastRefresh }: StatusBarProps) {
  if (!status) {
    return null;
  }

  const count = status.meters_count ?? 0;
  const noun = count === 1 ? 'meter' : 'meters';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200">
      <span>{`Monitoring ${count} ${noun}`}</span>
      {lastRefresh && <span>{`Last refresh: ${formatClock(lastRefresh)}`}</span>}
    </div>
  );
}
