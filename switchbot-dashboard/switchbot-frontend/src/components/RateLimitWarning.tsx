export function RateLimitWarning({ backoffRemaining }: { backoffRemaining: number }) {
  return (
    <div className="mb-4 rounded border border-warn bg-warn-bg px-4 py-2 text-sm text-warn-text">
      <strong>Rate Limited.</strong>{' '}
      {`SwitchBot API rate limit reached. Retry in ${backoffRemaining} seconds.`}
    </div>
  );
}
