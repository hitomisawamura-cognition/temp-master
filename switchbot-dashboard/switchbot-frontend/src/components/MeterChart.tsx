import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeScale } from '../api/types';
import { useHistoryQuery } from '../hooks/useDashboardData';
import { useThemeColors } from '../theme/useThemeColors';
import { formatTimestamp } from '../utils/format';

interface MeterChartProps {
  deviceId: string;
  timeScale: TimeScale;
}

export function MeterChart({ deviceId, timeScale }: MeterChartProps) {
  const colors = useThemeColors();
  const { data, isPending, isError } = useHistoryQuery(deviceId, timeScale);

  if (isPending) {
    return <p className="h-[200px] text-xs text-muted">Loading history...</p>;
  }

  if (isError) {
    return <p className="h-[200px] text-xs text-muted">履歴データを取得できませんでした</p>;
  }

  const points = data.history.map((reading) => ({
    label: formatTimestamp(reading.timestamp, timeScale),
    temperature: reading.temperature,
  }));

  if (points.length === 0) {
    return <p className="h-[200px] text-xs text-muted">履歴データがありません</p>;
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={colors.chartGrid} />
          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fontSize: 10, fill: colors.muted }}
            stroke={colors.chartGrid}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: colors.muted }}
            stroke={colors.chartGrid}
            tickFormatter={(value: number) => `${value}\u00b0`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.panel,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: 12,
            }}
            labelStyle={{ color: colors.muted }}
            formatter={(value) => [`${Number(value).toFixed(1)}\u00b0C`, 'Temperature']}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={colors.chartLine}
            strokeWidth={2}
            dot={{ r: 2, fill: colors.chartLine, stroke: colors.chartLine }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
