import type { Meter, TimeScale } from '../api/types';
import { MeterGrid } from './MeterGrid';

interface StaleMeterSectionProps {
  meters: Meter[];
  timeScale: TimeScale;
}

export function StaleMeterSection({ meters, timeScale }: StaleMeterSectionProps) {
  if (meters.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <header className="mb-2">
        <h3 className="text-lg font-semibold text-warn-text">⚠ 未更新のメーター</h3>
        <p className="mt-1 text-xs text-warn-text">1週間以上更新されていないデバイス</p>
      </header>
      <div className="rounded border border-warn bg-warn-bg p-4">
        <MeterGrid meters={meters} timeScale={timeScale} isStale />
      </div>
    </section>
  );
}
