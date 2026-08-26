import { useEffect, useState } from 'react';
import { getHistory } from '../api';
import { getDisplayName } from '../displayNames';
import type { Theme } from '../theme';
import type { MeterDevice, MeterReading, TimeScale } from '../types';
import { MeterChart } from './MeterChart';

interface MeterCardProps {
  meter: MeterDevice;
  stale: boolean;
  timeScale: TimeScale;
  theme: Theme;
}

export function MeterCard({ meter, stale, timeScale, theme }: MeterCardProps): JSX.Element {
  const [history, setHistory] = useState<MeterReading[]>([]);

  useEffect(() => {
    if (stale) return;
    let cancelled = false;
    setHistory([]);
    getHistory(meter.device_id, timeScale)
      .then((response) => {
        if (!cancelled) setHistory(response.history ?? []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [meter.device_id, stale, timeScale]);

  return (
    <article className={`meter-card${stale ? ' meter-card-stale' : ''}`}>
      <header className="meter-card-header">
        <div className="meter-card-title">
          <strong>{getDisplayName(meter.device_name)}</strong>
          {stale && <span className="stale-badge">7日以上未更新</span>}
        </div>
        <span className="device-type-tag">{meter.device_type}</span>
      </header>
      <div className="meter-card-body">
        <div className="meter-stats">
          {meter.current_temperature !== null && (
            <span className="stat-badge temperature">{meter.current_temperature}°C</span>
          )}
          {meter.current_humidity !== null && (
            <span className="stat-badge humidity">{meter.current_humidity}%</span>
          )}
          {meter.battery !== null && (
            <span className="stat-badge battery">{meter.battery}%</span>
          )}
        </div>
        {stale ? (
          <p className="stale-meter-empty">履歴データの取得対象外</p>
        ) : (
          <div className="meter-chart-wrap">
            <MeterChart history={history} timeScale={timeScale} theme={theme} />
          </div>
        )}
        {meter.last_updated ? (
          <p className="meter-last-updated">
            Last updated: {new Date(meter.last_updated).toLocaleString()}
          </p>
        ) : (
          stale && <p className="stale-meter-empty">値がありません（データ未受信）</p>
        )}
      </div>
    </article>
  );
}
