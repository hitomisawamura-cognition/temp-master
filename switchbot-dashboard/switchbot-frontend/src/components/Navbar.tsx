import { ThemeToggle } from './ThemeToggle';
import type { ThemeMode } from '../hooks/useTheme';

interface NavbarProps {
  connected: boolean;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

/** ブランド表示・接続ステータス・テーマ切替を含むナビバー */
export function Navbar({ connected, themeMode, onThemeChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight">Temp Master Dashboard</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            connected
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
          }`}
        >
          {connected ? 'Connected' : 'Disconnected'}
        </span>
        <div className="ml-auto">
          <ThemeToggle mode={themeMode} onChange={onThemeChange} />
        </div>
      </div>
    </header>
  );
}
