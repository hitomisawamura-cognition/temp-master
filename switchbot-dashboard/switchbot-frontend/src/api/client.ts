import type {
  HistoryResponse,
  MetersResponse,
  RefreshResponse,
  StatusResponse,
  TimeScale,
} from './types'

/**
 * Base URL of the backend API. When VITE_API_URL is unset the app talks to its own
 * origin with relative paths, which is how the production container serves it.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export function apiUrl(path: string): string {
  return `${API_URL}${path}`
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

export function fetchHistory(deviceId: string, timeScale: TimeScale): Promise<HistoryResponse> {
  const query = new URLSearchParams({ time_scale: timeScale })
  return request<HistoryResponse>(
    `/api/meters/${encodeURIComponent(deviceId)}/history?${query.toString()}`,
  )
}

export function triggerRefresh(): Promise<RefreshResponse> {
  return request<RefreshResponse>('/api/meters/refresh', { method: 'POST' })
}
