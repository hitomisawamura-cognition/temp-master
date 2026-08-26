import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchHistory, type TimeScale } from '../api/client'
import { useTheme } from '../context/ThemeContext'
import { formatTimestamp } from '../utils/meters'

interface MeterChartProps {
  deviceId: string
  timeScale: TimeScale
  refreshKey: number
}

interface ChartPoint {
  label: string
  temperature: number
}

const CHART_COLORS = {
  light: {
    line: '#d9534f',
    grid: 'rgba(0, 0, 0, 0.08)',
    axis: '#777777',
    tooltipBg: '#ffffff',
    tooltipBorder: '#dddddd',
    tooltipText: '#333333',
  },
  dark: {
    line: '#ff8a80',
    grid: 'rgba(255, 255, 255, 0.12)',
    axis: '#9aa4b2',
    tooltipBg: '#1f2733',
    tooltipBorder: '#39424f',
    tooltipText: '#e6e9ee',
  },
} as const

export default function MeterChart({ deviceId, timeScale, refreshKey }: MeterChartProps) {
  const { theme } = useTheme()
  const colors = CHART_COLORS[theme]
  const [points, setPoints] = useState<ChartPoint[] | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchHistory(deviceId, timeScale)
      .then((data) => {
        if (cancelled) {
          return
        }
        setPoints(
          data.history.map((reading) => ({
            label: formatTimestamp(reading.timestamp, timeScale),
            temperature: reading.temperature,
          })),
        )
      })
      .catch(() => {
        // History failures are non-fatal: keep the previously rendered chart.
      })

    return () => {
      cancelled = true
    }
  }, [deviceId, timeScale, refreshKey])

  if (points === null) {
    return <div className="chart-wrap chart-placeholder">Loading chart...</div>
  }

  if (points.length === 0) {
    return <div className="chart-wrap chart-placeholder">No history data</div>
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={colors.grid} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: colors.axis }}
            stroke={colors.axis}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 10, fill: colors.axis }}
            stroke={colors.axis}
            tickFormatter={(value: number) => `${value}\u00b0`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              color: colors.tooltipText,
              fontSize: 12,
            }}
            labelStyle={{ color: colors.tooltipText }}
            itemStyle={{ color: colors.line }}
            formatter={(value: number) => [`${value.toFixed(1)}\u00b0C`, 'Temperature']}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={colors.line}
            strokeWidth={2}
            dot={{ r: 2, fill: colors.line }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
