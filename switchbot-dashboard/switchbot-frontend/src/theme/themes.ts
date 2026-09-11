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

export function readStoredTheme(): ThemeId | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(stored) ? stored : null
  } catch {
    return null
  }
}

export function persistTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (disabled or sandboxed); theme still applies for this session.
  }
}

export function getInitialTheme(): ThemeId {
  const stored = readStoredTheme()
  if (stored) return stored
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}
