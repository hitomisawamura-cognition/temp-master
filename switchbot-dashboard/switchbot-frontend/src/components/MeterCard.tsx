import { TemperatureChart } from './TemperatureChart';
import { getDisplayName } from '../constants';
import { useMeterHistory } from '../hooks/useMeterHistory';
import type { Meter, TimeScale } from '../types';

interface MeterCardProps {
  meter: Meter;
  timeScale: TimeScale;
  isStale: boolean;
  isDark: boolean;
  refreshToken: number;
}

function StatBadge({ children, tone }: { children: string; tone: 'temp' | 'humidity' | 'battery' }) {
  const toneClass = {
    temp: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    humidity: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
    battery: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  }[tone];

  return (
    <span className={`rounded-md px-2 py-1 text-sm font-semibold ${toneClass}`}>{children}</span>
  );
}

/** 1台のメーターを表すカード。未更新メーターはチャートを描画しない */
export function MeterCard({ meter, timeScale, isStale, isDark, refreshToken }: MeterCardProps) {
  const { history, loading } = useMeterHistory(meter.device_id, timeScale, !isStale, refreshToken);

  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">{getDisplayName(meter.device_name)}</h2>
          {isStale && (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
              7日以上未更新
            </span>
          )}
        </div>
        <span className="rounded-full bg-surface-muted px-2 py-1 text-[11px] text-content-muted">
          {meter.device_type}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {meter.current_temperature != null && (
            <StatBadge tone="temp">{`${meter.current_temperature}°C`}</StatBadge>
          )}
          {meter.current_humidity != null && (
            <StatBadge tone="humidity">{`${meter.current_humidity}%`}</StatBadge>
          )}
          {meter.battery != null && <StatBadge tone="battery">{`${meter.battery}%`}</StatBadge>}
        </div>

        {isStale ? (
          <p className="text-sm text-amber-800 dark:text-amber-300">履歴データの取得対象外</p>
        ) : loading ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-content-muted">
            読み込み中...
          </div>
        ) : (
          <TemperatureChart history={history} timeScale={timeScale} isDark={isDark} />
        )}

        {meter.last_updated ? (
          <p className="mt-auto text-xs text-content-muted">
            {`Last updated: ${new Date(meter.last_updated).toLocaleString()}`}
          </p>
        ) : (
          isStale && (
            <p className="mt-auto text-sm text-amber-800 dark:text-amber-300">
              値がありません（データ未受信）
            </p>
          )
        )}
      </div>
    </article>
  );
}
