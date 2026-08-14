import type { Meter, TimeScale } from '../api/types';
import { MeterCard } from './MeterCard';

interface MeterGridProps {
  meters: Meter[];
  timeScale: TimeScale;
  isStale?: boolean;
}

export function MeterGrid({ meters, timeScale, isStale = false }: MeterGridProps) {
  if (meters.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {meters.map((meter) => (
        <MeterCard key={meter.device_id} meter={meter} timeScale={timeScale} isStale={isStale} />
      ))}
    </div>
  );
}
