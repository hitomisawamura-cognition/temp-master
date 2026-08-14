interface StatusBarProps {
  metersCount: number
  lastRefresh: string | null
}

export function StatusBar({ metersCount, lastRefresh }: StatusBarProps) {
  const noun = metersCount === 1 ? 'meter' : 'meters'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-panel px-4 py-2 text-sm text-info">
      <span>{`Monitoring ${metersCount} ${noun}`}</span>
      {lastRefresh && <span className="text-muted">{`Last refresh: ${lastRefresh}`}</span>}
    </div>
  )
}
