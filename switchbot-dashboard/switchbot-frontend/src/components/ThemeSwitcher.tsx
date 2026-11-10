import { useTheme } from '../theme/ThemeContext'
import { THEMES } from '../theme/themes'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div role="radiogroup" aria-label="テーマ" className="flex items-center gap-1 rounded-full border border-border bg-surface-muted p-1">
      {THEMES.map((t) => {
        const selected = t.id === theme
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={selected}
            title={t.label}
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              selected ? 'bg-accent text-accent-contrast shadow-sm' : 'text-muted hover:text-fg'
            }`}
          >
            <span
              aria-hidden
              className="inline-block size-3 rounded-full ring-1 ring-black/10"
              style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
            />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
