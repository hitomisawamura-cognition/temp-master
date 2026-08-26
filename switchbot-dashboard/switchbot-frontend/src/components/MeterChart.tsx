import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Theme } from '../theme';
import type { MeterReading, TimeScale } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface MeterChartProps {
  history: MeterReading[];
  timeScale: TimeScale;
  theme: Theme;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function formatTimestamp(timestamp: string, timeScale: TimeScale): string {
  const date = new Date(timestamp);
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  const monthShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][date.getMonth()];

  switch (timeScale) {
    case 'hour':
    case 'day':
      return `${hours}:${minutes}`;
    case 'week':
      return `${dayShort} ${hours}`;
    case 'month':
    case 'year':
      return `${monthShort} ${date.getDate()}`;
    default:
      return date.toLocaleString();
  }
}

export function MeterChart({ history, timeScale, theme }: MeterChartProps): JSX.Element {
  const isDark = theme === 'dark';
  const tickColor = isDark ? '#d7e0e8' : '#777';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const labels = history.map((reading) => formatTimestamp(reading.timestamp, timeScale));
  const temperatures = history.map((reading) => reading.temperature);

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Temperature (C)',
            data: temperatures,
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
      }}
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
                const value = context.parsed.y;
                return value === null ? '' : `${value.toFixed(1)}°C`;
              },
            },
            titleColor: tickColor,
            bodyColor: tickColor,
            backgroundColor: isDark ? '#26313d' : '#fff',
            borderColor: gridColor,
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, maxTicksLimit: 8, font: { size: 10 } },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 10 },
              callback: (value) => `${value}°`,
            },
          },
        },
      }}
    />
  );
}
