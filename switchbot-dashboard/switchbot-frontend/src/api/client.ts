export type TimeScale = 'hour' | 'day' | 'week' | 'month' | 'year'

export interface Meter {
  device_id: string
  device_name: string
  device_type: string
  hub_device_id: string | null
  current_temperature: number | null
  current_humidity: number | null
  battery: number | null
  last_updated: string | null
}

export interface MetersResponse {
  meters: Meter[]
  last_updated: string | null
}

export interface MeterReading {
  timestamp: string
  temperature: number
  humidity: number
  battery: number | null
}

export interface HistoryResponse {
  device_id: string
  time_scale: TimeScale
  history: MeterReading[]
  device: Meter | null
}

export interface StatusResponse {
  configured: boolean
  meters_count: number
  is_rate_limited: boolean
  backoff_remaining: number
  last_api_call: number
  collection_interval: number
}

export interface RefreshResponse {
  status: string
  message: string
  meters_count: number
}

export const API_URL: string = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)
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
  return request<HistoryResponse>(`/api/meters/${encodeURIComponent(deviceId)}/history?${query}`)
}

export function triggerRefresh(): Promise<RefreshResponse> {
  return request<RefreshResponse>('/api/meters/refresh', { method: 'POST' })
}

export function backupUrl(): string {
  return `${API_URL}/api/backup`
}
