import type { Meter } from '../api/types';

export const STALE_METER_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export function isStaleMeter(meter: Meter): boolean {
  if (!meter.last_updated) {
    return true;
  }

  const lastUpdated = new Date(meter.last_updated);
  if (Number.isNaN(lastUpdated.getTime())) {
    return true;
  }

  return Date.now() - lastUpdated.getTime() >= STALE_METER_THRESHOLD_MS;
}

export function splitMetersByStaleness(meters: Meter[]): {
  activeMeters: Meter[];
  staleMeters: Meter[];
} {
  const activeMeters: Meter[] = [];
  const staleMeters: Meter[] = [];

  for (const meter of meters) {
    if (isStaleMeter(meter)) {
      staleMeters.push(meter);
    } else {
      activeMeters.push(meter);
    }
  }

  return { activeMeters, staleMeters };
}
