import type { Meter, TimeScale } from '../types';
import { STALE_METER_THRESHOLD_MS } from '../constants';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** 時間スケールに応じてタイムスタンプを整形する（旧実装と同じ書式） */
export function formatTimestamp(timestamp: string | number | Date, timeScale: TimeScale): string {
  const date = new Date(timestamp);
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());

  switch (timeScale) {
    case 'hour':
    case 'day':
      return `${hours}:${minutes}`;
    case 'week':
      return `${DAY_SHORT[date.getDay()]} ${hours}`;
    case 'month':
    case 'year':
      return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
    default:
      return date.toLocaleString();
  }
}

/** 現在時刻を HH:MM:SS 形式で返す */
export function formatClock(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/** 7日以上更新がない、または更新時刻が不正なメーターを未更新と判定する */
export function isStaleMeter(meter: Meter, now: number = Date.now()): boolean {
  if (!meter.last_updated) {
    return true;
  }
  const lastUpdated = new Date(meter.last_updated);
  if (Number.isNaN(lastUpdated.getTime())) {
    return true;
  }
  return now - lastUpdated.getTime() >= STALE_METER_THRESHOLD_MS;
}
