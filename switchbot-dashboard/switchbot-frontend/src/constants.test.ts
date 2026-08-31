import { describe, expect, it } from 'vitest'
import { getDisplayName } from './constants'

describe('getDisplayName', () => {
  it('maps known device names to plant names', () => {
    expect(getDisplayName('Bedroom Meter')).toBe('第1蒸留塔 (T-101)')
  })

  it('falls back to the raw device name', () => {
    expect(getDisplayName('Unknown Device')).toBe('Unknown Device')
  })
})
