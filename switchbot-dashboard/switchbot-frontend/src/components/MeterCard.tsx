import type { Meter, TimeScale } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isPresent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { HistoryChart } from './HistoryChart';

interface MeterCardProps {
  meter: Meter;
  displayName: string;
  timeScale: TimeScale;
  stale?: boolean;
}

export function MeterCard({ meter, displayName, timeScale, stale = false }: MeterCardProps) {
  return (
    <Card data-testid="meter-card" className={cn('flex flex-col', stale && 'border-warning/60')}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{displayName}</CardTitle>
          {stale && <Badge variant="warning">7日以上未更新</Badge>}
        </div>
        <Badge variant="muted" className="shrink-0 text-[11px]">
          {meter.device_type}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {isPresent(meter.current_temperature) && (
            <Badge variant="danger" className="text-sm" title="Temperature">
              {meter.current_temperature}°C
            </Badge>
          )}
          {isPresent(meter.current_humidity) && (
            <Badge variant="info" className="text-sm" title="Humidity">
              {meter.current_humidity}%
            </Badge>
          )}
          {isPresent(meter.battery) && (
            <Badge variant="success" className="text-sm" title="Battery">
              {meter.battery}%
            </Badge>
          )}
        </div>

        {stale ? (
          <p className="text-sm text-muted-foreground">履歴データの取得対象外</p>
        ) : (
          <div className="relative h-[200px]">
            <HistoryChart deviceId={meter.device_id} timeScale={timeScale} />
          </div>
        )}

        {meter.last_updated ? (
          <p className="mt-auto text-xs text-muted-foreground">
            Last updated: {new Date(meter.last_updated).toLocaleString()}
          </p>
        ) : (
          stale && <p className="text-sm text-muted-foreground">値がありません（データ未受信）</p>
        )}
      </CardContent>
    </Card>
  );
}
