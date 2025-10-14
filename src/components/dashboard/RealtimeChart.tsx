import { Card } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart-simple';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure?: number;
}

interface RealtimeChartProps {
  title: string;
  data: DataPoint[];
  lines: {
    key: keyof DataPoint;
    color: string;
    name: string;
  }[];
}

export function RealtimeChart({ title, data, lines }: RealtimeChartProps) {
  return (
    <Card className="bg-gradient-card border-border p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <ChartContainer className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="timestamp" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                name={line.name}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}