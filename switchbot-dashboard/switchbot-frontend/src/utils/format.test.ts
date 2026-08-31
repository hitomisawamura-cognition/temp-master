import { describe, expect, it } from 'vitest'
import { formatClockTime, formatTimestamp, pad2 } from './format'

const SAMPLE = new Date(2024, 2, 5, 9, 7, 3).toISOString()

describe('pad2', () => {
  it('pads single digits', () => {
    expect(pad2(3)).toBe('03')
    expect(pad2(12)).toBe('12')
  })
})

describe('formatTimestamp', () => {
  it('formats hour and day scales as HH:mm', () => {
    expect(formatTimestamp(SAMPLE, 'hour')).toBe('09:07')
    expect(formatTimestamp(SAMPLE, 'day')).toBe('09:07')
  })

  it('formats week scale as weekday and hour', () => {
    expect(formatTimestamp(SAMPLE, 'week')).toBe('Tue 09')
  })

  it('formats month and year scales as month and day', () => {
    expect(formatTimestamp(SAMPLE, 'month')).toBe('Mar 5')
    expect(formatTimestamp(SAMPLE, 'year')).toBe('Mar 5')
  })
})

describe('formatClockTime', () => {
  it('formats a zero padded wall clock time', () => {
    expect(formatClockTime(new Date(2024, 0, 1, 8, 5, 9))).toBe('08:05:09')
  })
})
