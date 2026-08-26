import type {
  HistoryResponse,
  MetersResponse,
  StatusResponse,
  TimeScale,
} from './types';

const API_BASE_URL = '/api';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Use the HTTP status when the error response is not JSON.
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export function getMeters(): Promise<MetersResponse> {
  return requestJson<MetersResponse>(`${API_BASE_URL}/meters`);
}

export function getStatus(): Promise<StatusResponse> {
  return requestJson<StatusResponse>(`${API_BASE_URL}/status`);
}

export function getHistory(
  deviceId: string,
  timeScale: TimeScale,
): Promise<HistoryResponse> {
  const query = new URLSearchParams({ time_scale: timeScale });
  return requestJson<HistoryResponse>(
    `${API_BASE_URL}/meters/${encodeURIComponent(deviceId)}/history?${query.toString()}`,
  );
}

export function refreshMeters(): Promise<unknown> {
  return requestJson<unknown>(`${API_BASE_URL}/meters/refresh`, { method: 'POST' });
}

export function downloadBackup(): void {
  window.open(`${API_BASE_URL}/backup`, '_blank', 'noopener,noreferrer');
}
