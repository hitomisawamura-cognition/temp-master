import type { Meter, TimeScale } from '../api/types';
import { MeterGrid } from './MeterGrid';
import styles from './StaleMetersSection.module.css';
import ui from './ui.module.css';

interface StaleMetersSectionProps {
  meters: Meter[];
  timeScale: TimeScale;
}

export function StaleMetersSection({ meters, timeScale }: StaleMetersSectionProps) {
  if (!meters.length) {
    return null;
  }
  return (
    <div className={styles.section} data-testid="stale-meters-section">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span aria-hidden="true">&#9888;</span> 未更新のメーター
        </h3>
        <p className={styles.subtitle}>1週間以上更新されていないデバイス</p>
      </div>
      <div className={`${ui.panel} ${styles.panel}`}>
        <div className={ui.panelBody}>
          <MeterGrid meters={meters} isStale timeScale={timeScale} refreshKey={null} />
        </div>
      </div>
    </div>
  );
}
