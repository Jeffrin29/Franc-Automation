import { useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface CircularGaugeProps {
  title: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  thresholds?: {
    warning: number;
    critical: number;
  };
}

export function CircularGauge({ 
  title, 
  value, 
  min, 
  max, 
  unit, 
  thresholds 
}: CircularGaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const strokeDasharray = `${percentage} 100`;
  
  const status = useMemo(() => {
    if (!thresholds) return 'good';
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'good';
  }, [value, thresholds]);

  const statusColors = {
    good: '#10b981', // hsl(142 76% 36%)
    warning: '#f59e0b', // hsl(38 92% 50%)
    critical: '#ef4444' // hsl(0 84% 60%)
  };

  return (
    <Card className="bg-gradient-card border-border p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={statusColors[status]}
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${statusColors[status]}40)`
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: statusColors[status] }}>
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-xs text-muted-foreground">
          Range: {min} - {max} {unit}
        </div>
        {thresholds && (
          <div className="text-xs text-muted-foreground mt-1">
            Warning: {thresholds.warning} | Critical: {thresholds.critical}
          </div>
        )}
      </div>
    </Card>
  );
}