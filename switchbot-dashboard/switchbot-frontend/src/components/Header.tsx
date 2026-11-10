import { ThemeSwitcher } from './ThemeSwitcher'

export type ConnectionState = 'connecting' | 'connected' | 'disconnected'

const CONNECTION_STYLES: Record<ConnectionState, { label: string; dot: string }> = {
  connecting: { label: '接続中…', dot: 'bg-muted animate-pulse' },
  connected: { label: '接続済み', dot: 'bg-success' },
  disconnected: { label: '切断', dot: 'bg-danger' },
}

export function Header({ connection }: { connection: ConnectionState }) {
  const c = CONNECTION_STYLES[connection]
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <h1 className="glow font-display text-lg font-semibold tracking-tight">Temp Master Dashboard</h1>
        <div className="flex items-center gap-3">
          <span
            data-testid="connection-status"
            data-state={connection}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted"
          >
            <span aria-hidden className={`size-2 rounded-full ${c.dot}`} />
            {c.label}
          </span>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
