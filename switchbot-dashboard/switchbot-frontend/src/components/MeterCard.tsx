import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MeterDevice, MeterReading, TimeScale } from '../api';
import type { Theme } from '../hooks/useTheme';
import { formatTimestamp } from '../lib/format';
import { getDisplayName } from '../lib/displayNames';

interface MeterCardProps {
  meter: MeterDevice;
  history: MeterReading[];
  timeScale: TimeScale;
  stale: boolean;
  theme: Theme;
}

const chartColors = {
  light: {
    axis: '#777',
    grid: 'rgba(0, 0, 0, 0.08)',
    line: '#d9534f',
    fill: 'rgba(217, 83, 79, 0.15)',
    tooltipBackground: '#ffffff',
  },
  dark: {
    axis: '#a9b4c2',
    grid: 'rgba(255, 255, 255, 0.14)',
    line: '#ff817d',
    fill: 'rgba(255, 129, 125, 0.2)',
    tooltipBackground: '#202833',
  },
} as const;

export function MeterCard({ meter, history, timeScale, stale, theme }: MeterCardProps) {
  const colors = chartColors[theme];
  const parsedLastUpdated = meter.last_updated ? new Date(meter.last_updated) : null;

  return (
    <article className={`panel meter-card ${stale ? 'stale-card' : ''}`}>
      <div className="panel-heading meter-heading">
        <div className="meter-title">
          <strong>{getDisplayName(meter.device_name)}</strong>
          {stale && <span className="badge badge-warning">7日以上未更新</span>}
        </div>
        <span className="device-type-tag">{meter.device_type}</span>
      </div>
      <div className="panel-body">
        <div className="meter-stats">
          {meter.current_temperature != null && (
            <span className="badge badge-temperature">{meter.current_temperature}°C</span>
          )}
          {meter.current_humidity != null && (
            <span className="badge badge-humidity">{meter.current_humidity}%</span>
          )}
          {meter.battery != null && (
            <span className="badge badge-battery">{meter.battery}%</span>
          )}
        </div>
        {stale ? (
          <p className="stale-meter-empty">履歴データの取得対象外</p>
        ) : (
          <div className="meter-chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={colors.grid} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value: string) => formatTimestamp(value, timeScale)}
                  tick={{ fill: colors.axis, fontSize: 10 }}
                  interval={Math.max(0, Math.ceil(history.length / 8) - 1)}
                />
                <YAxis
                  tick={{ fill: colors.axis, fontSize: 10 }}
                  tickFormatter={(value: number) => `${value}°`}
                />
                <Tooltip
                  labelFormatter={(value) => formatTimestamp(String(value), timeScale)}
                  formatter={(value) => [
                    typeof value === 'number' ? `${value.toFixed(1)}°C` : value,
                    'Temperature',
                  ]}
                  contentStyle={{
                    backgroundColor: colors.tooltipBackground,
                    borderColor: colors.grid,
                    color: colors.axis,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke={colors.line}
                  fill={colors.fill}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colors.line }}
                  activeDot={{ r: 5, fill: '#5bc0de' }}
                  name="Temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {parsedLastUpdated && !Number.isNaN(parsedLastUpdated.getTime()) ? (
          <p className="meter-last-updated">Last updated: {parsedLastUpdated.toLocaleString()}</p>
        ) : stale ? (
          <p className="stale-meter-empty">値がありません（データ未受信）</p>
        ) : null}
      </div>
    </article>
  );
}
