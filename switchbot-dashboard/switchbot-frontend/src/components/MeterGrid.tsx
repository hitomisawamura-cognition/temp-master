import type { MeterDevice, MeterReading, TimeScale } from '../api';
import type { Theme } from '../hooks/useTheme';
import { MeterCard } from './MeterCard';

export const STALE_METER_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export function isStaleMeter(meter: MeterDevice): boolean {
  if (!meter.last_updated) {
    return true;
  }
  const lastUpdated = new Date(meter.last_updated);
  if (Number.isNaN(lastUpdated.getTime())) {
    return true;
  }
  return Date.now() - lastUpdated.getTime() >= STALE_METER_THRESHOLD_MS;
}

interface MeterGridProps {
  meters: MeterDevice[];
  histories: Record<string, MeterReading[]>;
  timeScale: TimeScale;
  theme: Theme;
}

export function MeterGrid({ meters, histories, timeScale, theme }: MeterGridProps) {
  const activeMeters = meters.filter((meter) => !isStaleMeter(meter));
  if (activeMeters.length === 0) {
    return null;
  }

  return (
    <div className="meter-grid">
      {activeMeters.map((meter) => (
        <MeterCard
          key={meter.device_id}
          meter={meter}
          history={histories[meter.device_id] || []}
          timeScale={timeScale}
          stale={false}
          theme={theme}
        />
      ))}
    </div>
  );
}
