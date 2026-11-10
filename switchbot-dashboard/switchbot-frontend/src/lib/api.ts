import type { HistoryResponse, MetersResponse, StatusResponse, TimeScale } from '../types'

const DEFAULT_API_URL = 'https://snakeroom.fly.dev'

export const API_URL = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '')

export function apiUrl(path: string): string {
  return `${API_URL}${path}`
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    throw new ApiError(res.status, `${init?.method ?? 'GET'} ${path} failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const api = {
  meters: (signal?: AbortSignal) => request<MetersResponse>('/api/meters', { signal }),
  status: (signal?: AbortSignal) => request<StatusResponse>('/api/status', { signal }),
  history: (deviceId: string, timeScale: TimeScale, signal?: AbortSignal) =>
    request<HistoryResponse>(
      `/api/meters/${encodeURIComponent(deviceId)}/history?time_scale=${timeScale}`,
      { signal },
    ),
  refresh: () => request<{ status: string; meters_count: number }>('/api/meters/refresh', { method: 'POST' }),
  backupUrl: () => apiUrl('/api/backup'),
}
