import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

interface DataEntry {
  id: string;
  timestamp: string;
  device: string;
  temperature: number;
  humidity: number;
  pressure?: number;
  status: 'online' | 'offline' | 'warning';
}

interface DataTableProps {
  title: string;
  data: DataEntry[];
}

export function DataTable({ title, data }: DataTableProps) {
  const getStatusBadge = (status: DataEntry['status']) => {
    const variants = {
      online: 'bg-metric-good text-foreground',
      offline: 'bg-metric-critical text-foreground',
      warning: 'bg-metric-warning text-foreground'
    };
    
    return (
      <Badge className={variants[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
    <Card className="bg-gradient-card border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Humidity</TableHead>
              <TableHead>Pressure</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-sm">
                  {entry.timestamp}
                </TableCell>
                <TableCell>{entry.device}</TableCell>
                <TableCell>{entry.temperature}°C</TableCell>
                <TableCell>{entry.humidity}%</TableCell>
                <TableCell>{entry.pressure ? `${entry.pressure} hPa` : '-'}</TableCell>
                <TableCell>{getStatusBadge(entry.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
    </DashboardLayout>
  );
}