import { describe, expect, it } from 'vitest';
import { formatClock, formatTimestamp, isStaleMeter, partitionMeters, STALE_METER_THRESHOLD_MS } from './format';

describe('formatTimestamp', () => {
  const ts = new Date(2026, 0, 5, 9, 7).toISOString(); // Mon Jan 5, 09:07 local

  it.each([
    ['hour', '09:07'],
    ['day', '09:07'],
    ['week', 'Mon 09'],
    ['month', 'Jan 5'],
    ['year', 'Jan 5'],
  ] as const)('%s -> %s', (scale, expected) => {
    expect(formatTimestamp(ts, scale)).toBe(expected);
  });
});

describe('formatClock', () => {
  it('zero-pads hours, minutes and seconds', () => {
    expect(formatClock(new Date(2026, 0, 1, 3, 4, 5))).toBe('03:04:05');
  });
});

describe('isStaleMeter', () => {
  const now = Date.UTC(2026, 10, 10);

  it('treats missing or invalid timestamps as stale', () => {
    expect(isStaleMeter({ last_updated: null }, now)).toBe(true);
    expect(isStaleMeter({ last_updated: 'not-a-date' }, now)).toBe(true);
  });

  it('uses a 7-day threshold', () => {
    expect(isStaleMeter({ last_updated: new Date(now - STALE_METER_THRESHOLD_MS + 1000).toISOString() }, now)).toBe(false);
    expect(isStaleMeter({ last_updated: new Date(now - STALE_METER_THRESHOLD_MS).toISOString() }, now)).toBe(true);
  });

  it('partitions meters into active and stale', () => {
    const fresh = { id: 'a', last_updated: new Date(now - 60_000).toISOString() };
    const old = { id: 'b', last_updated: null };
    expect(partitionMeters([fresh, old], now)).toEqual({ active: [fresh], stale: [old] });
  });
});
