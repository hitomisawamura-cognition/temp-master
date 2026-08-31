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
import { formatTimestamp } from '../utils/format'
import styles from './TemperatureChart.module.css'

const LINE_COLOR = '#d9534f'
const FILL_COLOR = 'rgba(217, 83, 79, 0.15)'
const GRID_COLOR = 'rgba(0, 0, 0, 0.05)'
const TICK_STYLE = { fontSize: 10, fill: '#777' }

interface TemperatureChartProps {
  history: MeterReading[]
  timeScale: TimeScale
}

export function TemperatureChart({ history, timeScale }: TemperatureChartProps) {
  const data = history.map((reading) => ({
    label: formatTimestamp(reading.timestamp, timeScale),
    temperature: reading.temperature,
  }))

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={GRID_COLOR} />
          <XAxis dataKey="label" tick={TICK_STYLE} interval="preserveStartEnd" minTickGap={20} />
          <YAxis
            tick={TICK_STYLE}
            domain={['auto', 'auto']}
            tickFormatter={(value: number) => `${value}\u00b0`}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number' ? `${value.toFixed(1)}\u00b0C` : ''
            }
          />
          <Area
            type="monotone"
            dataKey="temperature"
            name="Temperature (C)"
            stroke={LINE_COLOR}
            strokeWidth={2}
            fill={FILL_COLOR}
            dot={{ r: 3, fill: LINE_COLOR, stroke: LINE_COLOR }}
            activeDot={{ r: 5, fill: '#5bc0de', stroke: '#5bc0de' }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
