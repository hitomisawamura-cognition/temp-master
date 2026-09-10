import { useEffect, useState } from 'react'
import { fetchHistory } from '../api'
import { getDisplayName } from '../config'
import type { HistoryPoint, Meter, TimeScale } from '../types'
import { MeterChart } from './MeterChart'

interface MeterPanelProps {
  meter: Meter
  stale: boolean
  timeScale: TimeScale
}

export function MeterPanel({ meter, stale, timeScale }: MeterPanelProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([])

  useEffect(() => {
    if (stale) return
    let cancelled = false
    setHistory([])
    fetchHistory(meter.device_id, timeScale)
      .then((response) => {
        if (!cancelled) setHistory(response.history ?? [])
      })
      .catch(() => {
        if (!cancelled) setHistory([])
      })
    return () => { cancelled = true }
  }, [meter.device_id, stale, timeScale])

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <div className="meter-panel-header">
          <div className="meter-panel-title">
            <strong>{getDisplayName(meter.device_name)}</strong>
            {stale && <span className="label label-warning stale-meter-badge">7日以上未更新</span>}
          </div>
          <span className="device-type-tag">{meter.device_type}</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="meter-stats">
          {meter.current_temperature !== null && (
            <span className="label label-danger">{meter.current_temperature}°C</span>
          )}
          {meter.current_humidity !== null && (
            <span className="label label-info">{meter.current_humidity}%</span>
          )}
          {meter.battery !== null && (
            <span className="label label-success">{meter.battery}%</span>
          )}
        </div>
        {stale ? (
          <p className="stale-meter-empty">履歴データの取得対象外</p>
        ) : (
          <div className="meter-chart-wrap">
            <MeterChart history={history} timeScale={timeScale} />
          </div>
        )}
        {meter.last_updated ? (
          <p className="meter-last-updated">Last updated: {new Date(meter.last_updated).toLocaleString()}</p>
        ) : (
          stale && <p className="stale-meter-empty">値がありません（データ未受信）</p>
        )}
      </div>
    </div>
  )
}
