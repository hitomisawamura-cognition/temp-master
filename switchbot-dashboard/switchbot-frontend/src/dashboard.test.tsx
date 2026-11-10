import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { formatTimestamp, isStaleMeter } from './utils';
import { getDisplayName } from './displayNames';
import { applyTheme, initialTheme } from './theme';
import { downloadBackup } from './api';

vi.mock('./HistoryChart', () => ({
  HistoryChart: () => <div>History chart</div>,
}));
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
});
describe('formatTimestamp', () => {
  const date = new Date(2025, 0, 6, 9, 5).toISOString();
  it.each([
    ['hour', '09:05'],
    ['day', '09:05'],
    ['week', 'Mon 09'],
    ['month', 'Jan 6'],
    ['year', 'Jan 6'],
  ] as const)('%s labels', (scale, label) => {
    expect(formatTimestamp(date, scale)).toBe(label);
  });
});
it('classifies missing, invalid and seven-day-old updates as stale', () => {
  const now = Date.now();
  expect(isStaleMeter({ last_updated: null }, now)).toBe(true);
  expect(isStaleMeter({ last_updated: '' }, now)).toBe(true);
  expect(isStaleMeter({ last_updated: 'bad' }, now)).toBe(true);
  expect(
    isStaleMeter(
      { last_updated: new Date(now - 604800000).toISOString() },
      now,
    ),
  ).toBe(true);
  expect(
    isStaleMeter(
      { last_updated: new Date(now - 604799999).toISOString() },
      now,
    ),
  ).toBe(false);
});
it('maps known names and preserves unknown or empty names', () => {
  expect(getDisplayName('Bedroom Meter')).toBe('第1蒸留塔 (T-101)');
  expect(getDisplayName('Unknown')).toBe('Unknown');
  expect(getDisplayName('')).toBe('');
});
it('selects system theme initially and persists an explicit theme', () => {
  expect(initialTheme()).toBe('light');
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
  expect(initialTheme()).toBe('dark');
  applyTheme('industrial');
  expect(localStorage.getItem('theme')).toBe('industrial');
  expect(document.documentElement.dataset.theme).toBe('industrial');
  expect(initialTheme()).toBe('industrial');
  localStorage.setItem('theme', 'invalid');
  expect(initialTheme()).toBe('dark');
});
function mount() {
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <App />
    </QueryClientProvider>,
  );
}
function mockApi(meters: object[], historyOk = true) {
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const path = String(input);
    if (path.endsWith('/api/meters'))
      return Response.json({ meters, last_updated: null });
    if (path.endsWith('/api/status'))
      return Response.json({
        meters_count: meters.length,
        is_rate_limited: false,
      });
    if (path.includes('/history'))
      return historyOk
        ? Response.json({ history: [] })
        : new Response(null, { status: 500 });
    return new Response(null, { status: 401 });
  });
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}
it('renders active and stale meters and never fetches stale history', async () => {
  const fetcher = mockApi([
    {
      device_id: 'active',
      device_name: 'Active',
      device_type: 'Meter',
      current_temperature: 24.5,
      current_humidity: 50,
      battery: 90,
      last_updated: new Date().toISOString(),
    },
    {
      device_id: 'stale',
      device_name: 'Stale',
      device_type: 'Meter',
      last_updated: null,
    },
  ]);
  mount();
  expect(await screen.findByText('Active')).toBeInTheDocument();
  expect(screen.getByText('Stale')).toBeInTheDocument();
  expect(screen.getByText('7日以上未更新')).toBeInTheDocument();
  expect(await screen.findByText('No history available.')).toBeInTheDocument();
  expect(
    fetcher.mock.calls.some(([url]) => String(url).includes('/stale/history')),
  ).toBe(false);
  fireEvent.change(screen.getByRole('combobox', { name: 'Time Range:' }), {
    target: { value: 'week' },
  });
  await waitFor(() =>
    expect(
      fetcher.mock.calls.some(([url]) =>
        String(url).includes('time_scale=week'),
      ),
    ).toBe(true),
  );
  fireEvent.click(screen.getByText('Download Backup'));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'バックアップには認証が必要です',
  );
});
it('shows history fetch errors in the card', async () => {
  mockApi(
    [
      {
        device_id: 'active',
        device_name: 'Active',
        device_type: 'Meter',
        last_updated: new Date().toISOString(),
      },
    ],
    false,
  );
  mount();
  expect(
    await screen.findByText('History: Request failed (500)'),
  ).toBeInTheDocument();
});
it('shows empty meters', async () => {
  mockApi([]);
  mount();
  expect(await screen.findByText('No meters found.')).toBeInTheDocument();
});
it('keeps refresh disabled while pending and refetches after completion', async () => {
  const fetcher = mockApi([]);
  let finish: (response: Response) => void = () => {};
  const pending = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  mount();
  await screen.findByText('No meters found.');
  const before = fetcher.mock.calls.length;
  fetcher.mockImplementationOnce(() => pending);
  fireEvent.click(screen.getByText('Refresh Data'));
  expect(await screen.findByText('Refreshing...')).toBeDisabled();
  finish(Response.json({ status: 'ok' }));
  await waitFor(() => expect(screen.getByText('Refresh Data')).toBeEnabled());
  expect(fetcher.mock.calls.length).toBeGreaterThan(before + 1);
  expect(
    fetcher.mock.calls.some(([url]) =>
      String(url).endsWith('/api/meters/refresh'),
    ),
  ).toBe(true);
});
it('retains a usable theme when storage is blocked', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  expect(initialTheme()).toBe('light');
  expect(() => applyTheme('dark')).not.toThrow();
  expect(document.documentElement.dataset.theme).toBe('dark');
});
it('shows disconnected API errors', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));
  mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
  expect(screen.getByText('Disconnected')).toBeInTheDocument();
});
it.each([401, 403, 500])('reports backup failure %s', async (status) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status })),
  );
  await expect(downloadBackup()).rejects.toThrow(
    status === 500 ? 'Backup failed (500)' : 'バックアップには認証が必要です',
  );
});
it('downloads successful backups using a blob URL', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('database')));
  const create = vi.fn().mockReturnValue('blob:backup');
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: vi.fn() });
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
  await downloadBackup();
  expect(create).toHaveBeenCalledWith(expect.objectContaining({ size: 8 }));
  expect(click).toHaveBeenCalledOnce();
});
