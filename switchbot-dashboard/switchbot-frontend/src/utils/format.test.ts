import { describe, expect, it } from 'vitest';
import { formatTimestamp, isStaleMeter } from './format';
import type { Meter } from '../types';

function meter(lastUpdated: string | null): Meter {
  return {
    device_id: 'D1',
    device_name: 'Bedroom Meter',
    device_type: 'Meter',
    last_updated: lastUpdated,
  };
}

describe('formatTimestamp', () => {
  const timestamp = new Date(2026, 0, 15, 9, 5).toISOString();

  it('hour / day は HH:MM で整形する', () => {
    expect(formatTimestamp(timestamp, 'hour')).toBe('09:05');
    expect(formatTimestamp(timestamp, 'day')).toBe('09:05');
  });

  it('week は曜日と時を返す', () => {
    expect(formatTimestamp(timestamp, 'week')).toBe('Thu 09');
  });

  it('month / year は月日を返す', () => {
    expect(formatTimestamp(timestamp, 'month')).toBe('Jan 15');
    expect(formatTimestamp(timestamp, 'year')).toBe('Jan 15');
  });
});

describe('isStaleMeter', () => {
  const now = new Date(2026, 0, 15).getTime();

  it('last_updated が無い場合は未更新扱い', () => {
    expect(isStaleMeter(meter(null), now)).toBe(true);
  });

  it('不正な日時は未更新扱い', () => {
    expect(isStaleMeter(meter('not-a-date'), now)).toBe(true);
  });

  it('7日以上前は未更新、直近は有効', () => {
    expect(isStaleMeter(meter(new Date(now - 8 * 86400_000).toISOString()), now)).toBe(true);
    expect(isStaleMeter(meter(new Date(now - 60_000).toISOString()), now)).toBe(false);
  });
});
