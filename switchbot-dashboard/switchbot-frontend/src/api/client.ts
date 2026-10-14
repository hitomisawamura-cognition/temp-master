import type { HistoryResponse, MetersResponse, StatusResponse, TimeScale } from './types';

export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_URL + path, init);
  if (!res.ok) {
    throw new Error(res.statusText || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
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
  const query = new URLSearchParams({ time_scale: timeScale });
  return request<HistoryResponse>(
    `/api/meters/${encodeURIComponent(deviceId)}/history?${query.toString()}`,
    { signal },
  );
}

export function triggerRefresh(): Promise<unknown> {
  return request('/api/meters/refresh', { method: 'POST' });
}

export const BACKUP_URL = `${API_URL}/api/backup`;
