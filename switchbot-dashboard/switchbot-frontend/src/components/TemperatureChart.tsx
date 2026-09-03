import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '../theme/ThemeProvider'
import type { MeterReading, TimeScale } from '../types'
import { formatTimestamp } from '../utils'

interface TemperatureChartProps {
  history: MeterReading[]
  timeScale: TimeScale
}

export function TemperatureChart({ history, timeScale }: TemperatureChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gridColor = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)'
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const lineColor = isDark ? '#f87171' : '#dc2626'

  const data = history.map((reading) => ({
    label: formatTimestamp(reading.timestamp, timeScale),
    temperature: reading.temperature,
  }))

  if (data.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-sm text-slate-400 dark:text-slate-500">
        履歴データがありません
      </div>
    )
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={gridColor} />
          <XAxis
            dataKey="label"
            stroke={axisColor}
            tick={{ fontSize: 10, fill: axisColor }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            stroke={axisColor}
            tick={{ fontSize: 10, fill: axisColor }}
            domain={['auto', 'auto']}
            tickFormatter={(value: number) => `${value}\u00b0`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: 12,
              fontSize: 12,
              color: isDark ? '#e2e8f0' : '#0f172a',
            }}
            labelStyle={{ color: axisColor }}
            formatter={(value: number) => [`${value.toFixed(1)}\u00b0C`, 'Temperature']}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 2, fill: lineColor }}
            activeDot={{ r: 5, fill: '#38bdf8' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
