import type { MeterDevice, TimeScale } from '../api/types'
import { getDisplayName } from '../constants'
import { useMeterHistory } from '../hooks/useMeterHistory'
import { TemperatureChart } from './TemperatureChart'
import styles from './MeterCard.module.css'

interface MeterCardProps {
  meter: MeterDevice
  timeScale: TimeScale
  stale: boolean
  refreshToken: unknown
}

export function MeterCard({ meter, timeScale, stale, refreshToken }: MeterCardProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.heading}>
        <div className={styles.title}>
          <strong>{getDisplayName(meter.device_name)}</strong>
          {stale && <span className={styles.staleBadge}>7日以上未更新</span>}
        </div>
        <span className={styles.deviceTypeTag}>{meter.device_type}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.stats}>
          {meter.current_temperature !== null && meter.current_temperature !== undefined && (
            <span className={styles.statTemperature}>{`${meter.current_temperature}°C`}</span>
          )}
          {meter.current_humidity !== null && meter.current_humidity !== undefined && (
            <span className={styles.statHumidity}>{`${meter.current_humidity}%`}</span>
          )}
          {meter.battery !== null && meter.battery !== undefined && (
            <span className={styles.statBattery}>{`${meter.battery}%`}</span>
          )}
        </div>
        {stale ? (
          <p className={styles.staleEmpty}>履歴データの取得対象外</p>
        ) : (
          <MeterChart meter={meter} timeScale={timeScale} refreshToken={refreshToken} />
        )}
        {meter.last_updated ? (
          <p className={styles.lastUpdated}>
            {`Last updated: ${new Date(meter.last_updated).toLocaleString()}`}
          </p>
        ) : (
          stale && (
            <p className={styles.staleEmpty}>
              値がありません（データ未受信）
            </p>
          )
        )}
      </div>
    </div>
  )
}

interface MeterChartProps {
  meter: MeterDevice
  timeScale: TimeScale
  refreshToken: unknown
}

function MeterChart({ meter, timeScale, refreshToken }: MeterChartProps) {
  const history = useMeterHistory(meter.device_id, timeScale, refreshToken)
  return <TemperatureChart history={history} timeScale={timeScale} />
}
