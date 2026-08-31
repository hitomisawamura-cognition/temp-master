import { describe, expect, it } from 'vitest'
import type { MeterDevice } from '../api/types'
import { isStaleMeter, splitMetersByStaleness } from './staleMeter'

function meter(overrides: Partial<MeterDevice>): MeterDevice {
  return {
    device_id: 'D1',
    device_name: 'Bedroom Meter',
    device_type: 'Meter',
    hub_device_id: null,
    current_temperature: 21.5,
    current_humidity: 40,
    battery: 90,
    last_updated: new Date().toISOString(),
    ...overrides,
  }
}

describe('isStaleMeter', () => {
  it('treats a recently updated meter as active', () => {
    expect(isStaleMeter(meter({}))).toBe(false)
  })

  it('treats a meter without a timestamp as stale', () => {
    expect(isStaleMeter(meter({ last_updated: null }))).toBe(true)
  })

  it('treats an unparsable timestamp as stale', () => {
    expect(isStaleMeter(meter({ last_updated: 'not-a-date' }))).toBe(true)
  })

  it('treats a meter older than 7 days as stale', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    expect(isStaleMeter(meter({ last_updated: eightDaysAgo }))).toBe(true)
  })
})

describe('splitMetersByStaleness', () => {
  it('separates active and stale meters', () => {
    const active = meter({ device_id: 'A' })
    const stale = meter({ device_id: 'B', last_updated: null })
    expect(splitMetersByStaleness([active, stale])).toEqual({
      activeMeters: [active],
      staleMeters: [stale],
    })
  })
})
