import type { Meter, TimeScale } from '@/api/types';

export const STALE_METER_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatClock(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

export function formatTimestamp(timestamp: string | number | Date, timeScale: TimeScale): string {
  const date = new Date(timestamp);
  const hm = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  switch (timeScale) {
    case 'hour':
    case 'day':
      return hm;
    case 'week':
      return `${DAY_SHORT[date.getDay()]} ${pad2(date.getHours())}`;
    case 'month':
    case 'year':
      return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
    default:
      return date.toLocaleString();
  }
}

export function isStaleMeter(meter: Pick<Meter, 'last_updated'>, now: number = Date.now()): boolean {
  if (!meter.last_updated) return true;
  const lastUpdated = new Date(meter.last_updated).getTime();
  if (Number.isNaN(lastUpdated)) return true;
  return now - lastUpdated >= STALE_METER_THRESHOLD_MS;
}

export function partitionMeters<T extends Pick<Meter, 'last_updated'>>(
  meters: T[],
  now: number = Date.now(),
): { active: T[]; stale: T[] } {
  const active: T[] = [];
  const stale: T[] = [];
  for (const meter of meters) {
    (isStaleMeter(meter, now) ? stale : active).push(meter);
  }
  return { active, stale };
}

export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
