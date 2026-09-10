import { API_URL } from './config'
import type { HistoryPoint, Meter, Status, TimeScale } from './types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options)
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
      // Use the HTTP status when the error response is not JSON.
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export async function fetchMeters(): Promise<{ meters: Meter[] }> {
  return request<{ meters: Meter[] }>('/api/meters')
}

export async function fetchStatus(): Promise<Status> {
  return request<Status>('/api/status')
}

export async function fetchHistory(
  deviceId: string,
  timeScale: TimeScale,
): Promise<{ history: HistoryPoint[] }> {
  return request<{ history: HistoryPoint[] }>(
    `/api/meters/${encodeURIComponent(deviceId)}/history?time_scale=${timeScale}`,
  )
}

export async function triggerRefresh(): Promise<unknown> {
  return request<unknown>('/api/meters/refresh', { method: 'POST' })
}
