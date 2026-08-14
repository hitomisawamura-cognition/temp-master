import type {
  HistoryResponse,
  MetersResponse,
  StatusResponse,
  TimeScale,
} from './types'

// Empty by default so requests use same-origin relative paths (`/api/...`),
// which is what the backend serves in production.
export const API_URL: string = import.meta.env.VITE_API_URL ?? ''

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return (await response.json()) as T
}

export function fetchMeters(): Promise<MetersResponse> {
  return getJson<MetersResponse>('/api/meters')
}

export function fetchStatus(): Promise<StatusResponse> {
  return getJson<StatusResponse>('/api/status')
}

export function fetchHistory(
  deviceId: string,
  timeScale: TimeScale,
): Promise<HistoryResponse> {
  const query = new URLSearchParams({ time_scale: timeScale })
  return getJson<HistoryResponse>(
    `/api/meters/${encodeURIComponent(deviceId)}/history?${query.toString()}`,
  )
}

export async function triggerRefresh(): Promise<void> {
  const response = await fetch(`${API_URL}/api/meters/refresh`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
}

export function backupUrl(): string {
  return `${API_URL}/api/backup`
}
