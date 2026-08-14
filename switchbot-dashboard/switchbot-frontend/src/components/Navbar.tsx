import { ThemeSwitcher } from './ThemeSwitcher';

export function Navbar({ isConnected }: { isConnected: boolean }) {
  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-panel-header">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        <span className="text-lg font-semibold text-text">Temp Master Dashboard</span>
        <span className="text-sm text-muted">Dashboard</span>
        <div className="ml-auto flex items-center gap-4">
          <ThemeSwitcher />
          <span
            className={`rounded px-2 py-1 text-xs font-semibold ${
              isConnected ? 'bg-success text-panel' : 'bg-danger text-panel'
            }`}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </nav>
  );
}
