export function RateLimitBanner({ backoffRemaining }: { backoffRemaining: number }) {
  return (
    <div className="rounded border border-warning bg-warning-bg px-4 py-3 text-sm text-warning-fg">
      <strong>Rate Limited.</strong>{' '}
      {`SwitchBot API rate limit reached. Retry in ${backoffRemaining} seconds.`}
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded border border-danger px-4 py-3 text-sm text-danger">
      <strong>Error.</strong> {message}
    </div>
  )
}
