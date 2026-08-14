import { THEMES, isThemeId } from '../theme/themes';
import { useTheme } from '../theme/useTheme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Theme:</span>
      <select
        aria-label="Theme"
        className="rounded border border-border bg-panel px-2 py-1 text-sm text-text"
        value={theme}
        onChange={(event) => {
          const next = event.target.value;
          if (isThemeId(next)) {
            setTheme(next);
          }
        }}
      >
        {THEMES.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
