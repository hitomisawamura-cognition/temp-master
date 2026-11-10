import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Ticks,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Reading, TimeScale } from './types';
import type { Theme } from './theme';
import { formatTimestamp } from './utils';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);
export function HistoryChart({
  history,
  scale,
  theme,
}: {
  history: Reading[];
  scale: TimeScale;
  theme: Theme;
}) {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string) =>
    css.getPropertyValue('--chart-' + name).trim();
  return (
    <div className="chart" data-theme={theme}>
      <Line
        data={{
          labels: history.map((r) => formatTimestamp(r.timestamp, scale)),
          datasets: [
            {
              label: 'Temperature',
              data: history.map((r) => r.temperature),
              borderColor: color('line'),
              backgroundColor: color('fill'),
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.4,
              fill: true,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => context.parsed.y?.toFixed(1) + '°C',
              },
            },
          },
          scales: {
            x: {
              grid: { color: color('grid') },
              ticks: {
                color: color('tick'),
                maxTicksLimit: 6,
                font: { size: 10 },
              },
            },
            y: {
              grid: { color: color('grid') },
              ticks: {
                color: color('tick'),
                callback: function (value, index, ticks) {
                  return (
                    Ticks.formatters.numeric.call(
                      this,
                      Number(value),
                      index,
                      ticks,
                    ) + '°'
                  );
                },
              },
            },
          },
        }}
      />
    </div>
  );
}
