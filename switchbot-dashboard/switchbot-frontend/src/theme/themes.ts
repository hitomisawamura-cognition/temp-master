export const THEMES = [
  { id: 'light', label: 'ライト', swatch: ['#f8fafc', '#2563eb'] },
  { id: 'dark', label: 'ダーク', swatch: ['#0b1120', '#38bdf8'] },
  { id: 'control-room', label: 'コントロールルーム', swatch: ['#0a0f0a', '#f59e0b'] },
  { id: 'sakura', label: 'サクラ', swatch: ['#fff5f7', '#db2777'] },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export const DEFAULT_THEME: ThemeId = 'light'
export const THEME_STORAGE_KEY = 'temp-master-theme'

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value)
}
