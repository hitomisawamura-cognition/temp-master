import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MeterDevice } from '../api/types'
import { MeterCard } from './MeterCard'

const meter: MeterDevice = {
  device_id: 'D1',
  device_name: 'Bedroom Meter',
  device_type: 'Meter',
  hub_device_id: null,
  current_temperature: 21.5,
  current_humidity: 40,
  battery: 90,
  last_updated: new Date('2024-03-05T09:07:03Z').toISOString(),
}

describe('MeterCard', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ history: [] }),
      } as Response),
    )
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the japanese display name, stats and device type', async () => {
    await act(async () => {
      render(<MeterCard meter={meter} timeScale="day" stale={false} refreshToken={1} />)
    })

    expect(screen.getByText('第1蒸留塔 (T-101)')).toBeInTheDocument()
    expect(screen.getByText('21.5°C')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('Meter')).toBeInTheDocument()
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
  })

  it('shows a badge and hides the chart for stale meters', () => {
    render(
      <MeterCard
        meter={{ ...meter, last_updated: null }}
        timeScale="day"
        stale
        refreshToken={1}
      />,
    )

    expect(screen.getByText('7日以上未更新')).toBeInTheDocument()
    expect(
      screen.getByText('履歴データの取得対象外'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
