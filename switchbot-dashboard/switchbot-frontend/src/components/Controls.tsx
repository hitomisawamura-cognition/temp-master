import type { TimeScale } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { TIME_SCALE_OPTIONS } from '@/config/timeScales';

interface ControlsProps {
  timeScale: TimeScale;
  onTimeScaleChange: (timeScale: TimeScale) => void;
  onRefresh: () => void;
  refreshing: boolean;
  backupUrl: string;
}

export function Controls({ timeScale, onTimeScaleChange, onRefresh, refreshing, backupUrl }: ControlsProps) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3">
        <label htmlFor="time-scale-select" className="text-sm font-medium">
          Time Range:
        </label>
        <Select
          id="time-scale-select"
          value={timeScale}
          onChange={(event) => onTimeScaleChange(event.target.value as TimeScale)}
        >
          {TIME_SCALE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button onClick={onRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
        <Button variant="outline" onClick={() => window.open(backupUrl, '_blank', 'noopener')}>
          Download Backup
        </Button>
      </CardContent>
    </Card>
  );
}
