import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useMemo } from 'react'
import { formatTimestamp } from '../lib/format'
import { useTheme } from '../hooks/useTheme'
import type { MeterReading, TimeScale } from '../types/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface TemperatureChartProps {
  history: MeterReading[]
  timeScale: TimeScale
}

export function TemperatureChart({ history, timeScale }: TemperatureChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const lineColor = isDark ? '#fb7185' : '#dc2626'
  const fillColor = isDark ? 'rgba(251, 113, 133, 0.18)' : 'rgba(220, 38, 38, 0.15)'
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)'
  const tickColor = isDark ? '#94a3b8' : '#64748b'

  const data = useMemo<ChartData<'line'>>(
    () => ({
      labels: history.map((reading) => formatTimestamp(reading.timestamp, timeScale)),
      datasets: [
        {
          label: 'Temperature (C)',
          data: history.map((reading) => reading.temperature),
          borderColor: lineColor,
          backgroundColor: fillColor,
          borderWidth: 2,
          pointRadius: 2,
          pointBackgroundColor: lineColor,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.4,
        },
      ],
    }),
    [history, timeScale, lineColor, fillColor],
  )

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (item) => {
              const value = item.parsed.y
              return value === null || value === undefined ? '' : `${value.toFixed(1)}\u00b0C`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { maxTicksLimit: 8, font: { size: 10 }, color: tickColor },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            font: { size: 10 },
            color: tickColor,
            callback: (value) => `${value}\u00b0`,
          },
        },
      },
    }),
    [gridColor, tickColor],
  )

  if (history.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-sm text-slate-400 dark:text-slate-500">
        No history data yet
      </div>
    )
  }

  return (
    <div className="relative h-[200px]">
      <Line data={data} options={options} />
    </div>
  )
}
