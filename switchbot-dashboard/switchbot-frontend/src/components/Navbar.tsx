import type { Theme } from '../hooks/useTheme';

interface NavbarProps {
  connected: boolean;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Navbar({ connected, theme, onToggleTheme }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a className="navbar-brand" href="/">Temp Master Dashboard</a>
        <div className="navbar-actions">
          <span className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          <button className="theme-toggle" type="button" onClick={onToggleTheme}>
            {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
          </button>
        </div>
      </div>
    </nav>
  );
}
