import type { ReactNode } from 'react'
import type { Meter } from '../api/client'
import { getDisplayName } from '../utils/meters'

interface MeterCardProps {
  meter: Meter
  isStale?: boolean
  children?: ReactNode
}

export default function MeterCard({ meter, isStale = false, children }: MeterCardProps) {
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
          {meter.current_temperature !== null && (
            <span className="badge badge-danger">{meter.current_temperature}&deg;C</span>
          )}
          {meter.current_humidity !== null && (
            <span className="badge badge-info">{meter.current_humidity}%</span>
          )}
          {meter.battery !== null && (
            <span className="badge badge-success">{meter.battery}%</span>
          )}
        </div>

        {isStale ? <p className="stale-meter-note">履歴データの取得対象外</p> : children}

        {meter.last_updated ? (
          <p className="meter-last-updated">
            Last updated: {new Date(meter.last_updated).toLocaleString()}
          </p>
        ) : (
          isStale && <p className="stale-meter-note">値がありません（データ未受信）</p>
        )}
      </div>
    </div>
  )
}
