import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'

export interface ChartColors {
  line: string
  fill: string
  grid: string
  axis: string
  tooltipBg: string
  tooltipBorder: string
}

const CHART_VARIABLES: Record<keyof ChartColors, string> = {
  line: '--chart-line',
  fill: '--chart-fill',
  grid: '--chart-grid',
  axis: '--chart-axis',
  tooltipBg: '--color-panel',
  tooltipBorder: '--color-border',
}

function readChartColors(): ChartColors {
  const styles = getComputedStyle(document.documentElement)
  const entries = Object.entries(CHART_VARIABLES).map(([key, variable]) => [
    key,
    styles.getPropertyValue(variable).trim(),
  ])
  return Object.fromEntries(entries) as ChartColors
}

/** Resolves the theme's chart CSS variables into concrete colors Recharts can consume. */
export function useChartColors(): ChartColors {
  const { theme } = useTheme()
  const [colors, setColors] = useState<ChartColors>(readChartColors)

  useEffect(() => {
    setColors(readChartColors())
  }, [theme])

  return colors
}
