export const THEMES = [
  { id: 'light', label: 'Light', description: 'ライト' },
  { id: 'dark', label: 'Dark', description: 'ダーク' },
  { id: 'contrast', label: 'High contrast', description: 'ハイコントラスト' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const THEME_STORAGE_KEY = 'temp-master-theme';

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function getSystemTheme(): ThemeId {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): ThemeId | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: ThemeId): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode etc.): theme still applies for this page view.
  }
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
}

/** Reads an HSL-triplet CSS variable (e.g. `--chart-temperature`) as a CSS color. */
export function readThemeColor(name: string, fallback: string, alpha = 1): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!value) return fallback;
  return alpha === 1 ? `hsl(${value})` : `hsl(${value} / ${alpha})`;
}
