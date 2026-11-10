import { describe, expect, it } from 'vitest'
import { formatTimestamp, isStaleMeter, partitionMeters, STALE_METER_THRESHOLD_MS } from './format'
import type { Meter } from '../types'

const NOW = new Date('2026-11-10T12:00:00Z').getTime()

const meter = (id: string, last_updated: string | null): Meter => ({
  device_id: id,
  device_name: id,
  device_type: 'Meter',
  current_temperature: 20,
  current_humidity: 50,
  battery: 100,
  last_updated,
})

describe('isStaleMeter', () => {
  it('treats missing or invalid timestamps as stale', () => {
    expect(isStaleMeter({ last_updated: null }, NOW)).toBe(true)
    expect(isStaleMeter({ last_updated: 'not-a-date' }, NOW)).toBe(true)
  })

  it('uses a 7 day threshold', () => {
    expect(isStaleMeter({ last_updated: new Date(NOW - STALE_METER_THRESHOLD_MS + 1000).toISOString() }, NOW)).toBe(false)
    expect(isStaleMeter({ last_updated: new Date(NOW - STALE_METER_THRESHOLD_MS).toISOString() }, NOW)).toBe(true)
  })
})

describe('partitionMeters', () => {
  it('splits active and stale meters', () => {
    const { active, stale } = partitionMeters(
      [meter('a', new Date(NOW).toISOString()), meter('b', null)],
      NOW,
    )
    expect(active.map((m) => m.device_id)).toEqual(['a'])
    expect(stale.map((m) => m.device_id)).toEqual(['b'])
  })
})

describe('formatTimestamp', () => {
  const ts = new Date(2026, 10, 10, 9, 5).getTime()
  it('formats per time scale', () => {
    expect(formatTimestamp(ts, 'hour')).toBe('09:05')
    expect(formatTimestamp(ts, 'week')).toBe('11/10(火) 09時')
    expect(formatTimestamp(ts, 'month')).toBe('11/10')
  })
})
