import type {
  HistoryResponse,
  MetersResponse,
  RefreshResponse,
  StatusResponse,
  TimeScale,
} from './types'

// Empty string means same-origin (used when the backend serves the built frontend).
export const API_URL = (import.meta.env.VITE_API_URL ?? 'https://snakeroom.fly.dev').replace(
  /\/$/,
  '',
)

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const fetchMeters = () => request<MetersResponse>('/api/meters')

export const fetchStatus = () => request<StatusResponse>('/api/status')

export const fetchHistory = (deviceId: string, timeScale: TimeScale) =>
  request<HistoryResponse>(
    `/api/meters/${encodeURIComponent(deviceId)}/history?time_scale=${timeScale}`,
  )

export const triggerRefresh = () =>
  request<RefreshResponse>('/api/meters/refresh', { method: 'POST' })

export const backupUrl = `${API_URL}/api/backup`
