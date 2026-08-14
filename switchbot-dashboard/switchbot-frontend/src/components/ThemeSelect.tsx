import { useTheme } from '../theme/ThemeProvider'
import { isThemeName, THEME_LABELS, THEMES } from '../theme/themes'

export function ThemeSelect() {
  const { theme, setTheme } = useTheme()

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Theme</span>
      <select
        aria-label="Theme"
        className="rounded border border-border bg-panel px-2 py-1 text-sm text-fg"
        value={theme}
        onChange={(event) => {
          if (isThemeName(event.target.value)) {
            setTheme(event.target.value)
          }
        }}
      >
        {THEMES.map((name) => (
          <option key={name} value={name}>
            {THEME_LABELS[name]}
          </option>
        ))}
      </select>
    </label>
  )
}
