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
import type { ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useHistory } from '../hooks/useDashboardData'
import type { TimeScale } from '../api/types'
import { formatTimestamp } from '../lib/format'
import { useTheme } from '../theme/ThemeProvider'
import { getChartPalette } from '../theme/chartTheme'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

interface Props {
  deviceId: string
  timeScale: TimeScale
}

export function MeterChart({ deviceId, timeScale }: Props) {
  const { theme } = useTheme()
  const palette = getChartPalette(theme)
  const { data, isPending, isError } = useHistory(deviceId, timeScale)

  if (isPending) {
    return <div className="chart-placeholder">Loading history...</div>
  }

  if (isError) {
    return <div className="chart-placeholder">History unavailable</div>
  }

  const history = data?.history ?? []

  if (history.length === 0) {
    return <div className="chart-placeholder">No history for this range</div>
  }

  const chartData = {
    labels: history.map((point) => formatTimestamp(point.timestamp, timeScale)),
    datasets: [
      {
        label: 'Temperature (C)',
        data: history.map((point) => point.temperature),
        borderColor: palette.line,
        backgroundColor: palette.fill,
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: palette.point,
        pointBorderColor: palette.point,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: palette.pointHover,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: palette.tooltipBg,
        titleColor: palette.tooltipText,
        bodyColor: palette.tooltipText,
        callbacks: {
          label: (item) => {
            const value = item.parsed.y
            return value === null || value === undefined
              ? ''
              : `${value.toFixed(1)}\u00b0C`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: palette.grid },
        border: { color: palette.grid },
        ticks: {
          maxTicksLimit: 8,
          font: { size: 10 },
          color: palette.tick,
        },
      },
      y: {
        grid: { color: palette.grid },
        border: { color: palette.grid },
        ticks: {
          font: { size: 10 },
          color: palette.tick,
          callback: (value) => `${value}\u00b0`,
        },
      },
    },
  }

  return (
    <div className="chart-wrap">
      <Line data={chartData} options={options} />
    </div>
  )
}
