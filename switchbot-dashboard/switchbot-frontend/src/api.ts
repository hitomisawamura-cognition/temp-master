export interface MeterDevice {
  device_id: string;
  device_name: string;
  device_type: string;
  hub_device_id: string | null;
  current_temperature: number | null;
  current_humidity: number | null;
  battery: number | null;
  last_updated: string | null;
}

export interface MeterReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  battery: number | null;
}

export interface Status {
  configured: boolean;
  meters_count: number;
  is_rate_limited: boolean;
  backoff_remaining: number;
  last_api_call: number;
  collection_interval: number;
}

export type TimeScale = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface MetersResponse {
  meters: MeterDevice[];
  last_updated: string | null;
}

export interface HistoryResponse {
  device_id: string;
  time_scale: TimeScale;
  history: MeterReading[];
  device: MeterDevice | null;
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function apiUrl(path: string): string {
  return `${API_BASE.replace(/\/$/, '')}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function fetchMeters(): Promise<MetersResponse> {
  return request<MetersResponse>('/api/meters');
}

export function fetchStatus(): Promise<Status> {
  return request<Status>('/api/status');
}

export function fetchHistory(
  deviceId: string,
  timeScale: TimeScale,
): Promise<HistoryResponse> {
  const encodedDeviceId = encodeURIComponent(deviceId);
  return request<HistoryResponse>(
    `/api/meters/${encodedDeviceId}/history?time_scale=${encodeURIComponent(timeScale)}`,
  );
}

export function triggerRefresh(): Promise<unknown> {
  return request<unknown>('/api/meters/refresh', { method: 'POST' });
}

export function getBackupUrl(): string {
  return apiUrl('/api/backup');
}
