import type { Meter, TimeScale } from '../api/types';
import { getDisplayName } from '../constants/displayNames';
import { MeterChart } from './MeterChart';

interface MeterCardProps {
  meter: Meter;
  timeScale: TimeScale;
  isStale?: boolean;
}

export function MeterCard({ meter, timeScale, isStale = false }: MeterCardProps) {
  return (
    <div className="rounded border border-border bg-panel">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-panel-header px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-text">{getDisplayName(meter.device_name)}</strong>
          {isStale && (
            <span className="rounded bg-warn px-2 py-0.5 text-xs font-semibold text-warn-bg">
              7日以上未更新
            </span>
          )}
        </div>
        <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] text-muted">
          {meter.device_type}
        </span>
      </div>

      <div className="p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {meter.current_temperature !== null && (
            <span className="rounded bg-danger px-2 py-1 text-sm font-semibold text-panel">
              {meter.current_temperature}
              {'\u00b0C'}
            </span>
          )}
          {meter.current_humidity !== null && (
            <span className="rounded bg-info px-2 py-1 text-sm font-semibold text-panel">
              {meter.current_humidity}%
            </span>
          )}
          {meter.battery !== null && (
            <span className="rounded bg-success px-2 py-1 text-sm font-semibold text-panel">
              {meter.battery}%
            </span>
          )}
        </div>

        {isStale ? (
          <p className="text-sm text-warn-text">履歴データの取得対象外</p>
        ) : (
          <MeterChart deviceId={meter.device_id} timeScale={timeScale} />
        )}

        {meter.last_updated ? (
          <p className="mt-2 text-xs text-muted">
            Last updated: {new Date(meter.last_updated).toLocaleString()}
          </p>
        ) : (
          isStale && <p className="text-sm text-warn-text">値がありません（データ未受信）</p>
        )}
      </div>
    </div>
  );
}
