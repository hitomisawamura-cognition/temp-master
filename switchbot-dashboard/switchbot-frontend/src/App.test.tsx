import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('react-chartjs-2', () => ({ Line: () => <canvas /> }))

const meter = {
  device_id: 'meter-1',
  device_name: 'Bedroom Meter',
  device_type: 'Meter',
  current_temperature: 21.5,
  current_humidity: 45,
  battery: 90,
  last_updated: new Date().toISOString(),
}

function mockFetch(response: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Server Error',
    json: () => Promise.resolve(response),
  })
}

function successfulFetch(meters: unknown) {
  return vi.fn().mockImplementation((url: string) => {
    if (url.endsWith('/api/meters')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ meters }) })
    }
    if (url.endsWith('/api/status')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ meters_count: 1, is_rate_limited: false, backoff_remaining: 0 }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ history: [] }) })
  })
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads and displays a meter display name', async () => {
    globalThis.fetch = successfulFetch([meter]) as typeof fetch
    render(<App />)
    await waitFor(() => expect(screen.queryByText('Loading temperature data...')).not.toBeInTheDocument())
    expect(screen.getByText('第1蒸留塔 (T-101)')).toBeInTheDocument()
  })

  it('places stale meters in the stale section', async () => {
    globalThis.fetch = successfulFetch([{ ...meter, last_updated: null }]) as typeof fetch
    render(<App />)
    await waitFor(() => expect(screen.getByText('未更新のメーター')).toBeInTheDocument())
    expect(screen.getByText('履歴データの取得対象外')).toBeInTheDocument()
  })

  it('shows Disconnected on an error', async () => {
    globalThis.fetch = mockFetch({}, false) as typeof fetch
    render(<App />)
    await waitFor(() => expect(screen.getByText('Disconnected')).toBeInTheDocument())
    expect(screen.getByText(/Error\./)).toBeInTheDocument()
  })
})
