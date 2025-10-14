import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'good' | 'warning' | 'critical';
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  status = 'good',
  className
}: MetricCardProps) {
  const statusColors = {
    good: 'text-metric-good',
    warning: 'text-metric-warning',
    critical: 'text-metric-critical'
  };

  const trendColors = {
    up: 'text-metric-good',
    down: 'text-metric-critical',
    stable: 'text-muted-foreground'
  };

  return (
    <Card className={cn(
      'bg-gradient-card border-border p-6 transition-all duration-300 hover:shadow-dashboard',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-secondary rounded-lg">
          {icon}
        </div>
        {trend && trendValue && (
          <div className={cn('text-sm font-medium', trendColors[trend])}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-baseline space-x-1">
          <span className={cn('text-2xl font-bold', statusColors[status])}>
            {value}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
      </div>
    </Card>
  );
}