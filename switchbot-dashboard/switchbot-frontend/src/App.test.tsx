import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ThemeProvider } from './theme/ThemeProvider'

const now = new Date().toISOString()
const meters = {
  meters: [
    { device_id: 'A1', device_name: 'Bedroom Meter', device_type: 'Meter', current_temperature: 22.5, current_humidity: 40, battery: 90, last_updated: now },
    { device_id: 'B2', device_name: 'Old', device_type: 'MeterPlus', current_temperature: 18, current_humidity: 55, battery: 10, last_updated: '2020-01-01T00:00:00Z' },
  ],
  last_updated: now,
}
const status = { configured: true, meters_count: 2, is_rate_limited: false, backoff_remaining: 0, last_api_call: 0, collection_interval: 120 }

function mockFetch(fail = false) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (fail) return new Response('boom', { status: 500, statusText: 'Internal Server Error' })
    let body: unknown = {}
    if (url.includes('/history')) body = { device_id: 'A1', time_scale: 'day', history: [] }
    else if (url.endsWith('/api/meters')) body = meters
    else if (url.endsWith('/api/status')) body = status
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
  })
}

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dataset.theme = 'light'
  })
  afterEach(() => vi.unstubAllGlobals())

  it('renders active and stale meters with display names', async () => {
    vi.stubGlobal('fetch', mockFetch())
    renderApp()

    expect(await screen.findByText('第1蒸留塔 (T-101)')).toBeInTheDocument()
    expect(screen.getAllByTestId('meter-card')).toHaveLength(2)
    const staleSection = screen.getByRole('region', { name: '未更新のメーター' })
    expect(within(staleSection).getByText('Old')).toBeInTheDocument()
    expect(screen.getByTestId('connection-status')).toHaveAttribute('data-state', 'connected')
    expect(await screen.findByText('この期間のデータはありません')).toBeInTheDocument()
  })

  it('shows disconnected state on API failure', async () => {
    vi.stubGlobal('fetch', mockFetch(true))
    renderApp()
    await waitFor(() => expect(screen.getByTestId('connection-status')).toHaveAttribute('data-state', 'disconnected'))
    expect(screen.getByRole('alert')).toHaveTextContent('500')
  })

  it('switches and persists the theme', async () => {
    vi.stubGlobal('fetch', mockFetch())
    renderApp()
    await userEvent.click(screen.getByRole('radio', { name: 'ダーク' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('temp-master-theme')).toBe('dark')
    expect(screen.getByRole('radio', { name: 'ダーク' })).toHaveAttribute('aria-checked', 'true')
  })
})
