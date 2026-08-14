import type {
  HistoryResponse,
  MetersResponse,
  RefreshResponse,
  StatusResponse,
  TimeScale,
} from './types';

/**
 * Base URL for the backend.
 *
 * In development requests stay relative so the Vite dev-server proxy forwards
 * `/api` to `VITE_API_URL`. In a production build the value of `VITE_API_URL`
 * is used directly, and an empty value means "same origin as the frontend",
 * which is how FastAPI serves the built assets.
 */
export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export const BACKUP_URL = `${API_BASE_URL}/api/backup`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export function fetchMeters(signal?: AbortSignal): Promise<MetersResponse> {
  return request<MetersResponse>('/api/meters', { signal });
}

export function fetchStatus(signal?: AbortSignal): Promise<StatusResponse> {
  return request<StatusResponse>('/api/status', { signal });
}

export function fetchHistory(
  deviceId: string,
  timeScale: TimeScale,
  signal?: AbortSignal,
): Promise<HistoryResponse> {
  const params = new URLSearchParams({ time_scale: timeScale });
  return request<HistoryResponse>(
    `/api/meters/${encodeURIComponent(deviceId)}/history?${params.toString()}`,
    { signal },
  );
}

export function refreshMeters(): Promise<RefreshResponse> {
  return request<RefreshResponse>('/api/meters/refresh', { method: 'POST' });
}

export function openBackupDownload(): void {
  window.open(BACKUP_URL, '_blank');
}
