import { useMemo } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Ticks,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { TimeScale } from '@/api/types';
import { useHistory } from '@/hooks/useDashboardData';
import { formatTimestamp } from '@/lib/format';
import { readThemeColor, type ThemeId } from '@/theme/themes';
import { useTheme } from '@/theme/useTheme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface HistoryChartProps {
  deviceId: string;
  timeScale: TimeScale;
}

function chartPalette(theme: ThemeId) {
  return {
    theme,
    temperature: readThemeColor('--chart-temperature', '#d9534f'),
    temperatureFill: readThemeColor('--chart-temperature', 'rgba(217, 83, 79, 0.15)', 0.15),
    humidity: readThemeColor('--chart-humidity', '#5bc0de'),
    grid: readThemeColor('--chart-grid', 'rgba(0, 0, 0, 0.05)'),
    tick: readThemeColor('--muted-foreground', '#777'),
  };
}

export function HistoryChart({ deviceId, timeScale }: HistoryChartProps) {
  const { theme } = useTheme();
  const { data, isError, isPending } = useHistory(deviceId, timeScale);
  const palette = useMemo(() => chartPalette(theme), [theme]);
  const history = useMemo(() => data?.history ?? [], [data]);

  const chartData = useMemo<ChartData<'line'>>(
    () => ({
      labels: history.map((point) => formatTimestamp(point.timestamp, timeScale)),
      datasets: [
        {
          label: 'Temperature (°C)',
          data: history.map((point) => point.temperature),
          yAxisID: 'y',
          borderColor: palette.temperature,
          backgroundColor: palette.temperatureFill,
          pointBackgroundColor: palette.temperature,
          pointBorderColor: palette.temperature,
          borderWidth: 2,
          pointRadius: history.length > 60 ? 0 : 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Humidity (%)',
          data: history.map((point) => point.humidity),
          yAxisID: 'y1',
          borderColor: palette.humidity,
          backgroundColor: palette.humidity,
          borderWidth: 1.5,
          borderDash: [4, 3],
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.4,
        },
      ],
    }),
    [history, timeScale, palette],
  );

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: palette.tick, boxWidth: 10, boxHeight: 10, font: { size: 10 } },
        },
        tooltip: {
          callbacks: {
            label: (item) => {
              const value = item.parsed.y;
              if (value === null || value === undefined) return '';
              return item.dataset.yAxisID === 'y1' ? `${value.toFixed(0)}%` : `${value.toFixed(1)}°C`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: palette.grid },
          ticks: { maxTicksLimit: 8, color: palette.tick, font: { size: 10 } },
        },
        y: {
          position: 'left',
          grid: { color: palette.grid },
          ticks: {
            color: palette.tick,
            font: { size: 10 },
            callback(value, index, ticks) {
              return `${Ticks.formatters.numeric.call(this, Number(value), index, ticks)}°`;
            },
          },
        },
        y1: {
          position: 'right',
          suggestedMin: 0,
          suggestedMax: 100,
          grid: { drawOnChartArea: false },
          ticks: { color: palette.tick, font: { size: 10 }, callback: (value) => `${value}%` },
        },
      },
    }),
    [palette],
  );

  if (isError) {
    return <p className="flex h-full items-center justify-center text-sm text-muted-foreground">履歴データを取得できませんでした</p>;
  }
  if (isPending) {
    return <div className="h-full animate-pulse rounded-md bg-muted" aria-label="Loading chart" />;
  }

  return <Line data={chartData} options={options} aria-label="Temperature and humidity history" role="img" />;
}
