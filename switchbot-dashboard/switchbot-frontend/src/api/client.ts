import type {
  MeterHistoryResponse,
  MetersResponse,
  RefreshResponse,
  StatusResponse,
  TimeScale,
} from './types'

// Empty base URL means "same origin": in production the FastAPI backend serves
// this bundle itself, and in development Vite proxies /api to the backend.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return (await response.json()) as T
}

export function fetchMeters(): Promise<MetersResponse> {
  return request<MetersResponse>('/api/meters')
}

export function fetchStatus(): Promise<StatusResponse> {
  return request<StatusResponse>('/api/status')
}

export function fetchHistory(
  deviceId: string,
  timeScale: TimeScale,
): Promise<MeterHistoryResponse> {
  const query = new URLSearchParams({ time_scale: timeScale })
  return request<MeterHistoryResponse>(
    `/api/meters/${encodeURIComponent(deviceId)}/history?${query.toString()}`,
  )
}

export function triggerRefresh(): Promise<RefreshResponse> {
  return request<RefreshResponse>('/api/meters/refresh', { method: 'POST' })
}

export function backupUrl(): string {
  return apiUrl('/api/backup')
}
