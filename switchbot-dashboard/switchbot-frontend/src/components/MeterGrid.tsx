import type { Meter, TimeScale } from '@/api/types';
import { partitionMeters } from '@/lib/format';
import { MeterCard } from './MeterCard';

interface MeterGridProps {
  meters: Meter[];
  timeScale: TimeScale;
  resolveName: (deviceName: string) => string;
}

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

export function MeterGrid({ meters, timeScale, resolveName }: MeterGridProps) {
  const { active, stale } = partitionMeters(meters);

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className={GRID} data-testid="active-meters">
          {active.map((meter) => (
            <MeterCard key={meter.device_id} meter={meter} displayName={resolveName(meter.device_name)} timeScale={timeScale} />
          ))}
        </div>
      )}

      {stale.length > 0 && (
        <section aria-labelledby="stale-meters-title" data-testid="stale-meters" className="space-y-3">
          <div>
            <h2 id="stale-meters-title" className="flex items-center gap-2 text-lg font-semibold text-warning">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
              </svg>
              未更新のメーター
            </h2>
            <p className="text-xs text-muted-foreground">1週間以上更新されていないデバイス</p>
          </div>
          <div className={`${GRID} rounded-lg border border-warning/50 bg-warning/10 p-4`}>
            {stale.map((meter) => (
              <MeterCard key={meter.device_id} meter={meter} displayName={resolveName(meter.device_name)} timeScale={timeScale} stale />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
