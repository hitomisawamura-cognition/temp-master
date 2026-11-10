import { Badge } from '@/components/ui/badge';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Header({ connected }: { connected: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4">
        <a href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          Temp Master Dashboard
        </a>
        <nav className="hidden sm:block">
          <a href="/" aria-current="page" className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
            Dashboard
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ThemeSwitcher />
          <Badge data-testid="connection-status" variant={connected ? 'success' : 'danger'}>
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>
    </header>
  );
}
