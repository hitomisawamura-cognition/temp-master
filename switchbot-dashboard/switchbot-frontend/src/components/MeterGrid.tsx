import type { Meter, TimeScale } from '../api/types';
import styles from './MeterGrid.module.css';
import { MeterPanel } from './MeterPanel';

interface MeterGridProps {
  meters: Meter[];
  isStale: boolean;
  timeScale: TimeScale;
  refreshKey: unknown;
}

export function MeterGrid({ meters, isStale, timeScale, refreshKey }: MeterGridProps) {
  if (!meters.length) {
    return null;
  }
  return (
    <div className={styles.grid}>
      {meters.map((meter) => (
        <MeterPanel
          key={meter.device_id}
          meter={meter}
          isStale={isStale}
          timeScale={timeScale}
          refreshKey={refreshKey}
        />
      ))}
    </div>
  );
}
