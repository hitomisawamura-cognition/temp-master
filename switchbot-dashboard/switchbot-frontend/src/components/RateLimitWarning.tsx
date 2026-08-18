interface RateLimitWarningProps {
  backoffRemaining: number;
}

/** SwitchBot API のレート制限警告 */
export function RateLimitWarning({ backoffRemaining }: RateLimitWarningProps) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
      <strong className="font-semibold">Rate Limited.</strong>{' '}
      {`SwitchBot API rate limit reached. Retry in ${backoffRemaining} seconds.`}
    </div>
  );
}
