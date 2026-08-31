import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
      {isDark ? 'Light' : 'Dark'}
    </button>
  )
}
