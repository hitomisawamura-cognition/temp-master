export function RateLimitWarning({ backoffRemaining }: { backoffRemaining: number }) {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <strong className="font-semibold">Rate Limited.</strong> SwitchBot API rate limit reached.
      Retry in {backoffRemaining} seconds.
    </div>
  )
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
      <strong className="font-semibold">Error.</strong> {message}
    </div>
  )
}
