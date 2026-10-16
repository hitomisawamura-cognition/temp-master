import { describe, expect, it } from 'vitest';
import type { Meter } from '../api/types';
import { STALE_METER_THRESHOLD_MS, formatTimestamp, getDisplayName, isStaleMeter } from './meters';

const baseMeter: Meter = {
  device_id: 'X',
  device_name: 'Bedroom Meter',
  device_type: 'Meter',
};

describe('getDisplayName', () => {
  it('maps known names', () => {
    expect(getDisplayName('Bedroom Meter')).toBe('第1蒸留塔 (T-101)');
    expect(getDisplayName('マダラアオジタ')).toBe('ボイラー (B-1501)');
  });

  it('falls back to the raw name', () => {
    expect(getDisplayName('Study Hub')).toBe('Study Hub');
    expect(getDisplayName('toString')).toBe('toString');
  });
});

describe('isStaleMeter', () => {
  const now = Date.parse('2026-01-10T00:00:00Z');

  it('treats missing or invalid last_updated as stale', () => {
    expect(isStaleMeter({ ...baseMeter, last_updated: null }, now)).toBe(true);
    expect(isStaleMeter({ ...baseMeter }, now)).toBe(true);
    expect(isStaleMeter({ ...baseMeter, last_updated: 'not-a-date' }, now)).toBe(true);
  });

  it('uses a 7 day threshold', () => {
    const exactly = new Date(now - STALE_METER_THRESHOLD_MS).toISOString();
    const justUnder = new Date(now - STALE_METER_THRESHOLD_MS + 1000).toISOString();
    expect(isStaleMeter({ ...baseMeter, last_updated: exactly }, now)).toBe(true);
    expect(isStaleMeter({ ...baseMeter, last_updated: justUnder }, now)).toBe(false);
  });
});

describe('formatTimestamp', () => {
  const ts = new Date(2026, 1, 3, 9, 5).toISOString();

  it('formats per time scale', () => {
    expect(formatTimestamp(ts, 'hour')).toBe('09:05');
    expect(formatTimestamp(ts, 'day')).toBe('09:05');
    expect(formatTimestamp(ts, 'week')).toBe('Tue 09');
    expect(formatTimestamp(ts, 'month')).toBe('Feb 3');
    expect(formatTimestamp(ts, 'year')).toBe('Feb 3');
  });
});
