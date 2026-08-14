interface Props {
  backoffRemaining: number
}

export function RateLimitWarning({ backoffRemaining }: Props) {
  return (
    <div className="alert alert-warning">
      <span>
        <strong>Rate Limited.</strong> SwitchBot API rate limit reached. Retry in{' '}
        {backoffRemaining} seconds.
      </span>
    </div>
  )
}
