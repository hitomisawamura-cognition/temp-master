import { formatClockTime } from '../lib/format'

interface Props {
  metersCount: number
  lastRefresh: Date | null
}

export function StatusBar({ metersCount, lastRefresh }: Props) {
  const noun = metersCount === 1 ? 'meter' : 'meters'

  return (
    <div className="alert alert-info">
      <span>
        Monitoring {metersCount} {noun}
      </span>
      {lastRefresh && <span>Last refresh: {formatClockTime(lastRefresh)}</span>}
    </div>
  )
}
