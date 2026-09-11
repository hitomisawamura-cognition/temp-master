import type { Meter, TimeScale } from '../api/types'
import { useHistory } from '../hooks/useDashboardData'
import { getDisplayName } from '../utils/meters'
import styles from './MeterPanel.module.css'
import shared from './shared.module.css'
import { TemperatureChart } from './TemperatureChart'

interface MeterPanelProps {
  meter: Meter
  timeScale: TimeScale
  stale: boolean
}

export function MeterPanel({ meter, timeScale, stale }: MeterPanelProps) {
  const historyQuery = useHistory(meter.device_id, timeScale, !stale)
  const history = historyQuery.data?.history ?? []

  return (
    <div className={shared.panel}>
      <div className={shared.panelHeading}>
        <div className={styles.header}>
          <div className={styles.title}>
            <span>{getDisplayName(meter.device_name)}</span>
            {stale && (
              <span className={`${shared.badge} ${shared.badgeWarning}`}>7日以上未更新</span>
            )}
          </div>
          <span className={styles.deviceType}>{meter.device_type}</span>
        </div>
      </div>
      <div className={shared.panelBody}>
        <div className={styles.stats}>
          {meter.current_temperature != null && (
            <span className={`${shared.badge} ${shared.badgeDanger}`}>
              {meter.current_temperature}°C
            </span>
          )}
          {meter.current_humidity != null && (
            <span className={`${shared.badge} ${shared.badgeInfo}`}>{meter.current_humidity}%</span>
          )}
          {meter.battery != null && (
            <span className={`${shared.badge} ${shared.badgeSuccess}`}>{meter.battery}%</span>
          )}
        </div>
        {stale ? (
          <p className={styles.staleNote}>履歴データの取得対象外</p>
        ) : (
          <div className={styles.chartWrap}>
            {historyQuery.isPending ? (
              <div className={styles.chartPlaceholder}>Loading history...</div>
            ) : historyQuery.isError ? (
              <div className={styles.chartPlaceholder}>Failed to load history</div>
            ) : (
              <TemperatureChart history={history} timeScale={timeScale} />
            )}
          </div>
        )}
        {meter.last_updated ? (
          <p className={styles.lastUpdated}>
            Last updated: {new Date(meter.last_updated).toLocaleString()}
          </p>
        ) : (
          stale && <p className={styles.staleNote}>値がありません（データ未受信）</p>
        )}
      </div>
    </div>
  )
}
