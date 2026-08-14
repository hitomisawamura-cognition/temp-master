import { formatClockTime } from '../utils/format';

interface StatusBarProps {
  metersCount: number;
  lastRefresh: Date | null;
}

export function StatusBar({ metersCount, lastRefresh }: StatusBarProps) {
  const noun = metersCount === 1 ? 'meter' : 'meters';

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded border border-info bg-panel px-4 py-2 text-sm text-text">
      <span>{`Monitoring ${metersCount} ${noun}`}</span>
      {lastRefresh && <span>{`Last refresh: ${formatClockTime(lastRefresh)}`}</span>}
    </div>
  );
}
