import { describe, expect, it } from 'vitest'
import { STALE_METER_THRESHOLD_MS } from './config'
import type { Meter } from './types'
import { formatTimestamp, isStaleMeter } from './utils'

const timestamp = '2024-01-15T13:45:00.000Z'

describe('formatTimestamp', () => {
  it('formats hour and day as time', () => {
    const expected = new Date(timestamp)
    const time = `${String(expected.getHours()).padStart(2, '0')}:${String(expected.getMinutes()).padStart(2, '0')}`
    expect(formatTimestamp(timestamp, 'hour')).toBe(time)
    expect(formatTimestamp(timestamp, 'day')).toBe(time)
  })

  it('formats week as weekday and hour', () => {
    const date = new Date(timestamp)
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
    expect(formatTimestamp(timestamp, 'week')).toBe(`${weekday} ${String(date.getHours()).padStart(2, '0')}`)
  })

  it('formats month and year as month and day', () => {
    const date = new Date(timestamp)
    const month = date.toLocaleString('en', { month: 'short' })
    expect(formatTimestamp(timestamp, 'month')).toBe(`${month} ${date.getDate()}`)
    expect(formatTimestamp(timestamp, 'year')).toBe(`${month} ${date.getDate()}`)
  })
})

describe('isStaleMeter', () => {
  const meter: Meter = {
    device_id: 'id',
    device_name: 'Meter',
    device_type: 'Meter',
    current_temperature: 20,
    current_humidity: 50,
    battery: 90,
    last_updated: null,
  }

  it('treats null and invalid timestamps as stale', () => {
    expect(isStaleMeter(meter)).toBe(true)
    expect(isStaleMeter({ ...meter, last_updated: 'invalid' })).toBe(true)
  })

  it('treats old timestamps as stale', () => {
    const now = Date.now()
    expect(isStaleMeter({ ...meter, last_updated: new Date(now - STALE_METER_THRESHOLD_MS).toISOString() }, now)).toBe(true)
  })

  it('treats recent timestamps as active', () => {
    const now = Date.now()
    expect(isStaleMeter({ ...meter, last_updated: new Date(now - 1000).toISOString() }, now)).toBe(false)
  })
})
