import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDateTime, formatTimestamp } from '../lib/format'
import type { TimeScale } from '../types'

export interface ChartPoint {
  t: number
  temperature: number
}

export function TemperatureChart({ id, data, timeScale }: { id: string; data: ChartPoint[]; timeScale: TimeScale }) {
  const gradientId = `temp-fill-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--temp)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--temp)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v: number) => formatTimestamp(v, timeScale)}
          tick={{ fill: 'var(--muted)', fontSize: 10 }}
          stroke="var(--border)"
          minTickGap={24}
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => `${Number(v.toFixed(1))}°`}
          tick={{ fill: 'var(--muted)', fontSize: 10 }}
          stroke="var(--border)"
          width={48}
        />
        <Tooltip
          labelFormatter={(v) => formatDateTime(Number(v))}
          formatter={(v) => [`${Number(v).toFixed(1)}°C`, '温度']}
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="temperature"
          stroke="var(--temp)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
