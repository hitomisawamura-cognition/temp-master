import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MeterReading, TimeScale } from '../api/types'
import { useChartColors } from '../theme/useChartColors'
import { formatTimestamp } from '../utils/format'

interface TemperatureChartProps {
  history: MeterReading[]
  timeScale: TimeScale
}

export function TemperatureChart({ history, timeScale }: TemperatureChartProps) {
  const colors = useChartColors()

  const data = history.map((reading) => ({
    label: formatTimestamp(reading.timestamp, timeScale),
    temperature: reading.temperature,
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-xs text-muted">
        履歴データがありません
      </div>
    )
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={colors.grid} />
          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fontSize: 10, fill: colors.axis }}
            stroke={colors.grid}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: colors.axis }}
            stroke={colors.grid}
            tickFormatter={(value: number) => `${value}\u00b0`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 4,
              fontSize: 12,
            }}
            labelStyle={{ color: colors.axis }}
            formatter={(value: number) => [`${value.toFixed(1)}\u00b0C`, 'Temperature']}
          />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="none"
            fill={colors.fill}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={colors.line}
            strokeWidth={2}
            dot={{ r: 2, fill: colors.line, stroke: colors.line }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
