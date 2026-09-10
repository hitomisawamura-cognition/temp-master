import { API_URL } from '../config'
import type { TimeScale } from '../types'

interface ControlsProps {
  timeScale: TimeScale
  onTimeScaleChange: (timeScale: TimeScale) => void
  onRefresh: () => void
  refreshing: boolean
}

export function Controls({
  timeScale,
  onTimeScaleChange,
  onRefresh,
  refreshing,
}: ControlsProps) {
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <form className="form-inline">
          <div className="form-group" style={{ marginRight: 20 }}>
            <label htmlFor="time-scale-select" style={{ marginRight: 8 }}>Time Range:</label>
            <select
              id="time-scale-select"
              className="form-control"
              value={timeScale}
              onChange={(event) => onTimeScaleChange(event.target.value as TimeScale)}
            >
              <option value="hour">Last Hour</option>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <button type="button" className="btn btn-primary" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>{' '}
          <button
            type="button"
            className="btn btn-default"
            onClick={() => window.open(`${API_URL}/api/backup`, '_blank')}
          >
            Download Backup
          </button>
        </form>
      </div>
    </div>
  )
}
