import type { Meter, TimeScale } from '../types'

export const STALE_METER_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000

export const TIME_SCALE_OPTIONS: { value: TimeScale; label: string }[] = [
  { value: 'hour', label: '過去1時間' },
  { value: 'day', label: '過去24時間' },
  { value: 'week', label: '過去7日間' },
  { value: 'month', label: '過去30日間' },
  { value: 'year', label: '過去1年間' },
]

const pad2 = (n: number) => String(n).padStart(2, '0')
const DAYS = ['日', '月', '火', '水', '木', '金', '土']

export function formatTimestamp(timestamp: number | string, timeScale: TimeScale): string {
  const d = new Date(timestamp)
  const hm = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  switch (timeScale) {
    case 'hour':
    case 'day':
      return hm
    case 'week':
      return `${d.getMonth() + 1}/${d.getDate()}(${DAYS[d.getDay()]}) ${pad2(d.getHours())}時`
    case 'month':
    case 'year':
      return `${d.getMonth() + 1}/${d.getDate()}`
  }
}

export function formatDateTime(value: string | number | Date): string {
  const d = new Date(value)
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

export function isStaleMeter(meter: Pick<Meter, 'last_updated'>, now: number = Date.now()): boolean {
  if (!meter.last_updated) return true
  const t = new Date(meter.last_updated).getTime()
  if (Number.isNaN(t)) return true
  return now - t >= STALE_METER_THRESHOLD_MS
}

export function partitionMeters(meters: Meter[], now: number = Date.now()) {
  const active: Meter[] = []
  const stale: Meter[] = []
  for (const m of meters) (isStaleMeter(m, now) ? stale : active).push(m)
  return { active, stale }
}
