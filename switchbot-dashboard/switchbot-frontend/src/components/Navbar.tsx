import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  connected: boolean
}

export function Navbar({ connected }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-lg text-white">
            °
          </span>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Temp Master Dashboard
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">SwitchBot meter monitoring</p>
          </div>
        </div>
        <nav className="hidden sm:block">
          <a
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-sky-700 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300"
          >
            Dashboard
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span
            className={
              connected
                ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
            }
          >
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
