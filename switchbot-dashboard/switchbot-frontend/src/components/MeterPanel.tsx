import type { Meter, TimeScale } from '../api/types';
import { getDisplayName } from '../lib/meters';
import { MeterChart } from './MeterChart';
import styles from './MeterPanel.module.css';
import ui from './ui.module.css';

interface MeterPanelProps {
  meter: Meter;
  isStale: boolean;
  timeScale: TimeScale;
  refreshKey: unknown;
}

function hasValue(v: number | null | undefined): v is number {
  return v !== null && v !== undefined;
}

export function MeterPanel({ meter, isStale, timeScale, refreshKey }: MeterPanelProps) {
  return (
    <div className={ui.panel} data-testid="meter-panel" data-device-id={meter.device_id}>
      <div className={ui.panelHeading}>
        <div className={styles.header}>
          <div className={styles.title}>
            <strong>{getDisplayName(meter.device_name)}</strong>
            {isStale && <span className={`${ui.label} ${ui.labelWarning} ${styles.staleBadge}`}>7日以上未更新</span>}
          </div>
          <span className={styles.deviceTypeTag}>{meter.device_type}</span>
        </div>
      </div>
      <div className={ui.panelBody}>
        <div className={styles.stats}>
          {hasValue(meter.current_temperature) && (
            <span className={`${ui.label} ${ui.labelDanger}`}>{meter.current_temperature}&deg;C</span>
          )}
          {hasValue(meter.current_humidity) && (
            <span className={`${ui.label} ${ui.labelInfo}`}>{meter.current_humidity}%</span>
          )}
          {hasValue(meter.battery) && <span className={`${ui.label} ${ui.labelSuccess}`}>{meter.battery}%</span>}
        </div>
        {isStale ? (
          <p className={styles.staleEmpty}>履歴データの取得対象外</p>
        ) : (
          <div className={styles.chartWrap}>
            <MeterChart deviceId={meter.device_id} timeScale={timeScale} refreshKey={refreshKey} />
          </div>
        )}
        {meter.last_updated ? (
          <p className={styles.lastUpdated}>Last updated: {new Date(meter.last_updated).toLocaleString()}</p>
        ) : (
          isStale && <p className={styles.staleEmpty}>値がありません（データ未受信）</p>
        )}
      </div>
    </div>
  );
}
