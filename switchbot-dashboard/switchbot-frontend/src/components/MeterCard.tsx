import type { Meter, TimeScale } from '../api/types'
import { getDisplayName } from '../lib/displayNames'
import { MeterChart } from './MeterChart'

interface Props {
  meter: Meter
  timeScale: TimeScale
  isStale?: boolean
}

export function MeterCard({ meter, timeScale, isStale = false }: Props) {
  const lastUpdatedText = meter.last_updated
    ? new Date(meter.last_updated).toLocaleString()
    : null

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <strong>{getDisplayName(meter.device_name)}</strong>
          {isStale && <span className="badge badge-warning">7日以上未更新</span>}
        </div>
        <span className="device-type-tag">{meter.device_type}</span>
      </div>
      <div className="card-body">
        <div className="meter-stats">
          {meter.current_temperature !== null &&
            meter.current_temperature !== undefined && (
              <span className="stat stat-temperature">
                <span className="stat-label">Temp</span>
                {meter.current_temperature}&deg;C
              </span>
            )}
          {meter.current_humidity !== null &&
            meter.current_humidity !== undefined && (
              <span className="stat stat-humidity">
                <span className="stat-label">Humidity</span>
                {meter.current_humidity}%
              </span>
            )}
          {meter.battery !== null && meter.battery !== undefined && (
            <span className="stat stat-battery">
              <span className="stat-label">Battery</span>
              {meter.battery}%
            </span>
          )}
        </div>

        {isStale ? (
          <p className="stale-note">履歴データの取得対象外</p>
        ) : (
          <MeterChart deviceId={meter.device_id} timeScale={timeScale} />
        )}

        {lastUpdatedText ? (
          <p className="meter-last-updated">Last updated: {lastUpdatedText}</p>
        ) : (
          isStale && <p className="stale-note">値がありません（データ未受信）</p>
        )}
      </div>
    </div>
  )
}
