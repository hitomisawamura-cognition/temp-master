import { useEffect, useState } from 'react'
import { fetchHistory } from '../api/client'
import type { MeterReading, TimeScale } from '../api/types'

export function useMeterHistory(
  deviceId: string,
  timeScale: TimeScale,
  refreshToken: unknown,
): MeterReading[] {
  const [history, setHistory] = useState<MeterReading[]>([])

  useEffect(() => {
    let cancelled = false

    fetchHistory(deviceId, timeScale)
      .then((response) => {
        if (!cancelled) {
          setHistory(response.history ?? [])
        }
      })
      .catch(() => {
        // History failures are non-fatal: the card keeps its stats.
      })

    return () => {
      cancelled = true
    }
  }, [deviceId, timeScale, refreshToken])

  return history
}
