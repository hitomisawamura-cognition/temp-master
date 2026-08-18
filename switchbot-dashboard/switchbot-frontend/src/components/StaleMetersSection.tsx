import { MeterCard } from './MeterCard';
import type { Meter, TimeScale } from '../types';

interface StaleMetersSectionProps {
  meters: Meter[];
  timeScale: TimeScale;
  isDark: boolean;
  refreshToken: number;
}

/** 7日以上更新がないメーターを別枠で表示する */
export function StaleMetersSection({
  meters,
  timeScale,
  isDark,
  refreshToken,
}: StaleMetersSectionProps) {
  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
          ⚠ 未更新のメーター
        </h2>
        <p className="text-xs text-amber-800 dark:text-amber-300">
          1週間以上更新されていないデバイス
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {meters.map((meter) => (
          <MeterCard
            key={meter.device_id}
            meter={meter}
            timeScale={timeScale}
            isStale
            isDark={isDark}
            refreshToken={refreshToken}
          />
        ))}
      </div>
    </section>
  );
}
