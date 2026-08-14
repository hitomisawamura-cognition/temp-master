import { ThemeSelect } from './ThemeSelect'

export function Header({ connected }: { connected: boolean }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-panel-header">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-4 py-3">
        <h1 className="text-lg font-semibold">Temp Master Dashboard</h1>
        <nav className="text-sm">
          <a className="text-accent hover:underline" href="/">
            Dashboard
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <ThemeSelect />
          <span
            className={`rounded px-2 py-1 text-xs font-semibold ${
              connected ? 'bg-success text-accent-fg' : 'bg-danger text-accent-fg'
            }`}
          >
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  )
}
