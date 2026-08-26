import type { MeterDevice, MeterReading, TimeScale } from '../api';
import type { Theme } from '../hooks/useTheme';
import { isStaleMeter } from './MeterGrid';
import { MeterCard } from './MeterCard';

interface StaleMetersSectionProps {
  meters: MeterDevice[];
  histories: Record<string, MeterReading[]>;
  timeScale: TimeScale;
  theme: Theme;
}

export function StaleMetersSection({
  meters,
  histories,
  timeScale,
  theme,
}: StaleMetersSectionProps) {
  const staleMeters = meters.filter(isStaleMeter);
  if (staleMeters.length === 0) {
    return null;
  }

  return (
    <section className="meter-section">
      <div className="meter-section-header">
        <h2 className="meter-section-title">⚠ 未更新のメーター</h2>
        <p className="meter-section-subtitle">1週間以上更新されていないデバイス</p>
      </div>
      <div className="stale-meters-panel">
        <div className="meter-grid">
          {staleMeters.map((meter) => (
            <MeterCard
              key={meter.device_id}
              meter={meter}
              history={histories[meter.device_id] || []}
              timeScale={timeScale}
              stale
              theme={theme}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
