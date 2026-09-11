import { useMemo } from 'react'
import { useTheme } from './ThemeContext'
import type { ThemeId } from './themes'

export interface ChartColors {
  line: string
  fill: string
  grid: string
  axis: string
  tooltipBg: string
  tooltipText: string
  tooltipBorder: string
  hover: string
}

const VARS: Record<keyof ChartColors, string> = {
  line: '--chart-line',
  fill: '--chart-fill',
  grid: '--chart-grid',
  axis: '--chart-axis',
  tooltipBg: '--panel-bg',
  tooltipText: '--text',
  tooltipBorder: '--border',
  hover: '--chart-hover',
}

function readColors(theme: ThemeId): ChartColors {
  const root = document.querySelector<HTMLElement>(`:root[data-theme='${theme}']`)
  const style = getComputedStyle(root ?? document.documentElement)
  const out = {} as ChartColors
  for (const key of Object.keys(VARS) as (keyof ChartColors)[]) {
    out[key] = style.getPropertyValue(VARS[key]).trim()
  }
  return out
}

/**
 * Reads the chart-related CSS custom properties for the active theme.
 * ThemeProvider applies `data-theme` to <html> synchronously before re-rendering,
 * so computed styles are already up to date when this memo runs.
 */
export function useChartColors(): ChartColors {
  const { theme } = useTheme()
  return useMemo(() => readColors(theme), [theme])
}
