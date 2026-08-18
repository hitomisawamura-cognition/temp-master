import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatTimestamp } from '../utils/format';
import type { MeterReading, TimeScale } from '../types';

interface TemperatureChartProps {
  history: MeterReading[];
  timeScale: TimeScale;
  isDark: boolean;
}

/** 温度履歴を描画する折れ線チャート（配色はテーマに追従） */
export function TemperatureChart({ history, timeScale, isDark }: TemperatureChartProps) {
  const lineColor = isDark ? '#f87171' : '#d9534f';
  const axisColor = isDark ? '#94a3b8' : '#777777';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  const data = history.map((reading) => ({
    label: formatTimestamp(reading.timestamp, timeScale),
    temperature: reading.temperature,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-content-muted">
        履歴データがありません
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={gridColor} />
          <XAxis
            dataKey="label"
            tick={{ fill: axisColor, fontSize: 10 }}
            stroke={gridColor}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: axisColor, fontSize: 10 }}
            stroke={gridColor}
            tickFormatter={(value: number) => `${value}°`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: axisColor }}
            formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 2, fill: lineColor }}
            activeDot={{ r: 5, fill: '#5bc0de' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
