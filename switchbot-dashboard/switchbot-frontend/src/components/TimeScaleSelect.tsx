import type { TimeScale } from '../api/types'

const OPTIONS: { value: TimeScale; label: string }[] = [
  { value: 'hour', label: 'Last Hour' },
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last Year' },
]

interface Props {
  value: TimeScale
  onChange: (value: TimeScale) => void
}

export function TimeScaleSelect({ value, onChange }: Props) {
  return (
    <div className="control-group">
      <label className="control-label" htmlFor="time-scale-select">
        Time Range
      </label>
      <select
        id="time-scale-select"
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value as TimeScale)}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
