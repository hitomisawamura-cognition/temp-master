import type { MeterDevice } from '../api/types'
import { STALE_METER_THRESHOLD_MS } from '../constants'

export function isStaleMeter(meter: MeterDevice, now: number = Date.now()): boolean {
  if (!meter.last_updated) {
    return true
  }

  const lastUpdated = new Date(meter.last_updated)
  if (Number.isNaN(lastUpdated.getTime())) {
    return true
  }

  return now - lastUpdated.getTime() >= STALE_METER_THRESHOLD_MS
}

export function splitMetersByStaleness(meters: MeterDevice[]): {
  activeMeters: MeterDevice[]
  staleMeters: MeterDevice[]
} {
  const activeMeters: MeterDevice[] = []
  const staleMeters: MeterDevice[] = []

  for (const meter of meters) {
    if (isStaleMeter(meter)) {
      staleMeters.push(meter)
    } else {
      activeMeters.push(meter)
    }
  }

  return { activeMeters, staleMeters }
}
