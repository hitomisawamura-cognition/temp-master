export const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'solarized', label: 'Solarized' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export const THEME_STORAGE_KEY = 'temp-master-theme'

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value)
}

export function getInitialTheme(): ThemeId {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (isThemeId(stored)) return stored
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}
