import type { HistoryResponse, MetersResponse, RefreshResponse, StatusResponse, TimeScale } from './types';

/**
 * Base URL of the FastAPI backend. Empty means same-origin: FastAPI serves the
 * built `dist/` in production, and the Vite dev server proxies `/api` locally.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    let detail = response.statusText || `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === 'string') detail = body.detail;
    } catch {
      // Non-JSON error body: keep the status text.
    }
    throw new ApiError(response.status, detail);
  }
  return (await response.json()) as T;
}

export const api = {
  getMeters: () => request<MetersResponse>('/api/meters'),
  getStatus: () => request<StatusResponse>('/api/status'),
  getHistory: (deviceId: string, timeScale: TimeScale) =>
    request<HistoryResponse>(
      `/api/meters/${encodeURIComponent(deviceId)}/history?time_scale=${encodeURIComponent(timeScale)}`,
    ),
  refresh: () => request<RefreshResponse>('/api/meters/refresh', { method: 'POST' }),
  backupUrl: () => apiUrl('/api/backup'),
};

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
