import { formatDateTime } from '../lib/format'
import type { StatusResponse } from '../types'

export function StatusBar({ status, lastFetchedAt }: { status: StatusResponse; lastFetchedAt: number }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-muted px-4 py-2 text-sm text-muted">
        <span>
          監視中のメーター: <strong className="text-fg">{status.meters_count}</strong> 台
        </span>
        {lastFetchedAt > 0 && <span>最終取得: {formatDateTime(lastFetchedAt)}</span>}
      </div>
      {status.is_rate_limited && (
        <div role="alert" className="rounded-xl border border-warn/40 bg-warn-bg px-4 py-2 text-sm text-warn">
          <strong>レート制限中</strong>: SwitchBot API の上限に達しました。{status.backoff_remaining} 秒後に再試行します。
        </div>
      )}
    </div>
  )
}
