import type { Meter, TimeScale } from './types';
export function isStaleMeter(
  meter: Pick<Meter, 'last_updated'>,
  now = Date.now(),
) {
  const date = meter.last_updated ? Date.parse(meter.last_updated) : NaN;
  return !Number.isFinite(date) || now - date >= 7 * 24 * 60 * 60 * 1000;
}
export function formatTimestamp(timestamp: string, scale: TimeScale) {
  const d = new Date(timestamp);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  if (scale === 'hour' || scale === 'day') return hours + ':' + minutes;
  if (scale === 'week')
    return (
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] +
      ' ' +
      hours
    );
  return (
    [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ][d.getMonth()] +
    ' ' +
    d.getDate()
  );
}
