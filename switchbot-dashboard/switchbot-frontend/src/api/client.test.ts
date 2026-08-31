import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { backupUrl, fetchHistory, fetchMeters, triggerRefresh } from './client'

describe('api client', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response),
    )
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls same origin relative paths', async () => {
    await fetchMeters()
    expect(fetchMock).toHaveBeenCalledWith('/api/meters', undefined)
    expect(backupUrl()).toBe('/api/backup')
  })

  it('encodes the device id and time scale in history requests', async () => {
    await fetchHistory('AB/CD', 'week')
    expect(fetchMock).toHaveBeenCalledWith('/api/meters/AB%2FCD/history?time_scale=week', undefined)
  })

  it('posts to the refresh endpoint', async () => {
    await triggerRefresh()
    expect(fetchMock).toHaveBeenCalledWith('/api/meters/refresh', { method: 'POST' })
  })

  it('throws on error responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' } as Response),
      ),
    )
    await expect(fetchMeters()).rejects.toThrow('500 Server Error')
  })
})
