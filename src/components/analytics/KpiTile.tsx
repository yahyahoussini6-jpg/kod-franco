import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatMAD, formatRate, formatNumber, deltaPct } from '@/lib/metrics';

interface KpiTileProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'rate' | 'number';
  icon?: React.ReactNode;
  className?: string;
}

export function KpiTile({ 
  title, 
  value, 
  previousValue, 
  format = 'number',
  icon,
  className = ''
}: KpiTileProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatMAD(val);
      case 'rate':
        return formatRate(val);
      default:
        return formatNumber(val);
    }
  };

  const delta = previousValue !== undefined ? deltaPct(value, previousValue) : null;
  const isPositive = delta !== null && delta > 0;
  const isNegative = delta !== null && delta < 0;
  const isNeutral = delta !== null && delta === 0;

  const getDeltaIcon = () => {
    if (isPositive) return <TrendingUp className="h-3 w-3" />;
    if (isNegative) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getDeltaColor = () => {
    if (isPositive) return 'text-success';
    if (isNegative) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}
        </div>
        {delta !== null && (
          <div className={`flex items-center space-x-1 text-xs mt-1 ${getDeltaColor()}`}>
            {getDeltaIcon()}
            <span>
              {Math.abs(delta).toFixed(1)}% vs période précédente
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}