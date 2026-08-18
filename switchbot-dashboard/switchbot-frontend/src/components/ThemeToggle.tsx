import type { ThemeMode } from '../hooks/useTheme';

interface ThemeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const MODES: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'ライト', icon: '☀' },
  { value: 'dark', label: 'ダーク', icon: '☾' },
  { value: 'system', label: 'システム設定', icon: '🖥' },
];

/** ライト／ダーク／システム設定を切り替えるトグル */
export function ThemeToggle({ mode, onChange }: ThemeToggleProps) {
  return (
    <div
      role="group"
      aria-label="テーマ切替"
      className="flex items-center gap-1 rounded-full border border-border bg-surface-muted p-1"
    >
      {MODES.map((item) => {
        const active = mode === item.value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            title={item.label}
            onClick={() => onChange(item.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? 'bg-surface text-content shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            <span aria-hidden="true" className="mr-1">
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
