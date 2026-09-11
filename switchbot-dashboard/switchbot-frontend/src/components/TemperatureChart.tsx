import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MeterReading, TimeScale } from '../api/types'
import { useChartColors } from '../theme/useChartColors'
import { formatTimestamp } from '../utils/meters'

interface TemperatureChartProps {
  history: MeterReading[]
  timeScale: TimeScale
}

export function TemperatureChart({ history, timeScale }: TemperatureChartProps) {
  const colors = useChartColors()
  const data = history.map((r) => ({
    label: formatTimestamp(r.timestamp, timeScale),
    temperature: r.temperature,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke={colors.grid} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: colors.axis }}
          tickLine={false}
          axisLine={{ stroke: colors.grid }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 10, fill: colors.axis }}
          tickLine={false}
          axisLine={{ stroke: colors.grid }}
          tickFormatter={(v: number) => `${v}°`}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: 4,
            fontSize: 12,
          }}
          labelStyle={{ color: colors.tooltipText }}
          itemStyle={{ color: colors.line }}
          formatter={(value) =>
            typeof value === 'number' ? [`${value.toFixed(1)}°C`, 'Temperature'] : ['', '']
          }
        />
        <Area
          type="monotone"
          dataKey="temperature"
          stroke={colors.line}
          strokeWidth={2}
          fill={colors.fill}
          dot={{ r: 3, fill: colors.line, stroke: colors.line }}
          activeDot={{ r: 5, fill: colors.hover, stroke: colors.hover }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
