interface RateLimitWarningProps {
  remaining: number;
}

export function RateLimitWarning({ remaining }: RateLimitWarningProps): JSX.Element {
  return (
    <div className="rate-limit-warning" role="alert">
      <strong>Rate Limited.</strong>{' '}
      <span>SwitchBot API rate limit reached. Retry in {remaining} seconds.</span>
    </div>
  );
}
