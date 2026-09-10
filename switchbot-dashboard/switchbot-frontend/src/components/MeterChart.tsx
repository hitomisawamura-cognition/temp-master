import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { HistoryPoint, TimeScale } from '../types'
import { formatTimestamp } from '../utils'

ChartJS.register(CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip)

interface MeterChartProps {
  history: HistoryPoint[]
  timeScale: TimeScale
}

export function MeterChart({ history, timeScale }: MeterChartProps) {
  const data = {
    labels: history.map((point) => formatTimestamp(point.timestamp, timeScale)),
    datasets: [{
      label: 'Temperature (C)',
      data: history.map((point) => point.temperature),
      borderColor: '#d9534f',
      backgroundColor: 'rgba(217, 83, 79, 0.15)',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#d9534f',
      pointBorderColor: '#d9534f',
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#5bc0de',
      fill: true,
      tension: 0.4,
    }],
  }

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y
                return value === null || value === undefined ? '' : `${value.toFixed(1)}°C`
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { maxTicksLimit: 8, font: { size: 10 }, color: '#777' },
          },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              font: { size: 10 },
              color: '#777',
              callback: (value) => `${value}°`,
            },
          },
        },
      }}
    />
  )
}
