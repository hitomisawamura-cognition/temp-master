import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { ThemeProvider } from './theme/ThemeProvider';

vi.mock('react-chartjs-2', () => ({ Line: () => <canvas data-testid="history-chart" /> }));

const now = Date.now();
const meters = [
  {
    device_id: 'A1',
    device_name: 'Bedroom Meter',
    device_type: 'Meter',
    current_temperature: 24.5,
    current_humidity: 55,
    battery: 90,
    last_updated: new Date(now - 60_000).toISOString(),
  },
  {
    device_id: 'B2',
    device_name: 'Garage',
    device_type: 'MeterPlus',
    current_temperature: null,
    current_humidity: null,
    battery: null,
    last_updated: null,
  },
];
const status = { configured: true, meters_count: 2, is_rate_limited: true, backoff_remaining: 42, last_api_call: null, collection_interval: 120 };

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' }, ...init });
}

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  afterEach(() => vi.restoreAllMocks());

  it('renders meters, stale section, status bar and rate limit warning', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/api/meters')) return jsonResponse({ meters, last_updated: null });
      if (url.endsWith('/api/status')) return jsonResponse(status);
      if (url.includes('/api/meters/A1/history?time_scale=day')) return jsonResponse({ device_id: 'A1', time_scale: 'day', history: [] });
      return jsonResponse({ detail: 'Not Found' }, { status: 404 });
    });

    renderApp();

    expect(screen.getByText('Loading temperature data...')).toBeInTheDocument();
    expect(await screen.findByText('第1蒸留塔 (T-101)')).toBeInTheDocument();
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    expect(screen.getByTestId('status-bar')).toHaveTextContent('Monitoring 2 meters');
    expect(screen.getByTestId('rate-limit-warning')).toHaveTextContent('Retry in 42 seconds');

    const stale = screen.getByTestId('stale-meters');
    expect(within(stale).getByText('Garage')).toBeInTheDocument();
    expect(within(stale).getByText('値がありません（データ未受信）')).toBeInTheDocument();

    expect(await screen.findByTestId('history-chart')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/api/meters/B2/history'), expect.anything());
  });

  it('shows an error and Disconnected when the API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ detail: 'boom' }, { status: 500 }));

    renderApp();

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch meters: boom'));
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
  });

  it('clears a refresh error once meters and status reload successfully', async () => {
    let metersCalls = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/api/meters/refresh') && init?.method === 'POST') {
        return jsonResponse({ detail: 'Internal Server Error' }, { status: 500 });
      }
      if (url.endsWith('/api/meters')) {
        metersCalls += 1;
        return jsonResponse({ meters, last_updated: null });
      }
      if (url.endsWith('/api/status')) return jsonResponse(status);
      if (url.includes('/history')) return jsonResponse({ device_id: 'A1', time_scale: 'day', history: [] });
      return jsonResponse({ detail: 'Not Found' }, { status: 404 });
    });

    renderApp();
    await screen.findByText('第1蒸留塔 (T-101)');
    fireEvent.click(screen.getByRole('button', { name: /Refresh Data/ }));

    await waitFor(() => expect(metersCalls).toBeGreaterThanOrEqual(2));
    await waitFor(() => expect(screen.queryByTestId('error')).not.toBeInTheDocument());
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
  });

  it('keeps showing a refresh error while data has not reloaded since the failure', async () => {
    let failData = false;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/api/meters/refresh') && init?.method === 'POST') {
        failData = true;
        return jsonResponse({ detail: 'Internal Server Error' }, { status: 500 });
      }
      if (failData) return jsonResponse({ detail: 'down' }, { status: 503 });
      if (url.endsWith('/api/meters')) return jsonResponse({ meters, last_updated: null });
      if (url.endsWith('/api/status')) return jsonResponse(status);
      if (url.includes('/history')) return jsonResponse({ device_id: 'A1', time_scale: 'day', history: [] });
      return jsonResponse({ detail: 'Not Found' }, { status: 404 });
    });

    renderApp();
    await screen.findByText('第1蒸留塔 (T-101)');
    fireEvent.click(screen.getByRole('button', { name: /Refresh Data/ }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch meters: down'));
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
  });
});
