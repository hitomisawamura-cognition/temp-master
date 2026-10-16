import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Ticks,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { TimeScale } from '../api/types';
import { useHistory } from '../hooks/useHistory';
import { formatTimestamp } from '../lib/meters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const GRID_COLOR = 'rgba(0, 0, 0, 0.05)';
const TICK_COLOR = '#777';

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
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (ctx) => {
          const v = ctx.parsed.y;
          if (v === null || v === undefined) return '';
          return `${v.toFixed(1)}\u00b0C`;
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: { display: true, color: GRID_COLOR },
      ticks: { maxTicksLimit: 8, font: { size: 10 }, color: TICK_COLOR },
    },
    y: {
      display: true,
      grid: { display: true, color: GRID_COLOR },
      ticks: {
        font: { size: 10 },
        color: TICK_COLOR,
        callback(value, index, ticks) {
          return `${Ticks.formatters.numeric.call(this, Number(value), index, ticks)}\u00b0`;
        },
      },
    },
  },
};

interface MeterChartProps {
  deviceId: string;
  timeScale: TimeScale;
  refreshKey: unknown;
}

export function MeterChart({ deviceId, timeScale, refreshKey }: MeterChartProps) {
  const history = useHistory(deviceId, timeScale, refreshKey);

  const data = useMemo<ChartData<'line'>>(
    () => ({
      labels: history.map((r) => formatTimestamp(r.timestamp, timeScale)),
      datasets: [
        {
          label: 'Temperature (C)',
          data: history.map((r) => r.temperature),
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
        },
      ],
    }),
    [history, timeScale],
  );

  return <Line data={data} options={options} aria-label="Temperature history" role="img" />;
}
