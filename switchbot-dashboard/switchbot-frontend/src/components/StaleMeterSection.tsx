import type { Theme } from '../theme';
import type { MeterDevice, TimeScale } from '../types';
import { MeterCard } from './MeterCard';

interface StaleMeterSectionProps {
  meters: MeterDevice[];
  timeScale: TimeScale;
  theme: Theme;
}

export function StaleMeterSection({
  meters,
  timeScale,
  theme,
}: StaleMeterSectionProps): JSX.Element | null {
  if (meters.length === 0) return null;
  return (
    <section className="stale-meter-section">
      <div className="meter-section-header">
        <h2 className="meter-section-title">⚠ 未更新のメーター</h2>
        <p className="meter-section-subtitle">1週間以上更新されていないデバイス</p>
      </div>
      <div className="meter-grid stale-meter-grid">
        {meters.map((meter) => (
          <MeterCard
            key={meter.device_id}
            meter={meter}
            stale
            timeScale={timeScale}
            theme={theme}
          />
        ))}
      </div>
    </section>
  );
}
