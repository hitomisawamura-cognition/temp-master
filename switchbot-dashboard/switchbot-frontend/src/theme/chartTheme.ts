import type { Theme } from './ThemeProvider'

export interface ChartPalette {
  grid: string
  tick: string
  line: string
  fill: string
  point: string
  pointHover: string
  tooltipBg: string
  tooltipText: string
}

const PALETTES: Record<Theme, ChartPalette> = {
  light: {
    grid: 'rgba(15, 23, 42, 0.08)',
    tick: '#64748b',
    line: '#e11d48',
    fill: 'rgba(225, 29, 72, 0.14)',
    point: '#e11d48',
    pointHover: '#0ea5e9',
    tooltipBg: 'rgba(15, 23, 42, 0.9)',
    tooltipText: '#f8fafc',
  },
  dark: {
    grid: 'rgba(148, 163, 184, 0.18)',
    tick: '#94a3b8',
    line: '#fb7185',
    fill: 'rgba(251, 113, 133, 0.18)',
    point: '#fb7185',
    pointHover: '#38bdf8',
    tooltipBg: 'rgba(2, 6, 23, 0.92)',
    tooltipText: '#e2e8f0',
  },
}

export function getChartPalette(theme: Theme): ChartPalette {
  return PALETTES[theme]
}
