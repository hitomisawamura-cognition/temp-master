export const THEMES = ['light', 'dark', 'instrument'] as const

export type ThemeName = (typeof THEMES)[number]

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  instrument: 'Instrument Panel',
}

export const THEME_STORAGE_KEY = 'temp-master-theme'

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}
