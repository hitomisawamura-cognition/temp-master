interface StatusBarProps {
  metersCount: number;
  lastRefresh: Date | null;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function StatusBar({ metersCount, lastRefresh }: StatusBarProps): JSX.Element {
  const noun = metersCount === 1 ? 'meter' : 'meters';
  const refreshText = lastRefresh
    ? `Last refresh: ${pad2(lastRefresh.getHours())}:${pad2(
        lastRefresh.getMinutes(),
      )}:${pad2(lastRefresh.getSeconds())}`
    : '';

  return (
    <div className="status-bar" role="status">
      <span>Monitoring {metersCount} {noun}</span>
      <span>{refreshText}</span>
    </div>
  );
}
