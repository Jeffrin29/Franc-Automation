import { useState, useEffect } from 'react';

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
}

interface DataEntry {
  id: string;
  timestamp: string;
  device: string;
  temperature: number;
  humidity: number;
  pressure?: number;
  status: 'online' | 'offline' | 'warning';
}

export function useMockData() {
  const [currentData, setCurrentData] = useState<SensorData>({
    timestamp: new Date().toLocaleTimeString(),
    temperature: 23.5,
    humidity: 55,
    pressure: 1013.25
  });

  const [chartData, setChartData] = useState<SensorData[]>([]);
  const [tableData, setTableData] = useState<DataEntry[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      
      // Simulate realistic sensor data with some noise
      const newData: SensorData = {
        timestamp,
        temperature: 20 + Math.random() * 10 + Math.sin(now.getTime() / 60000) * 3,
        humidity: 50 + Math.random() * 20 + Math.cos(now.getTime() / 45000) * 10,
        pressure: 1010 + Math.random() * 10 + Math.sin(now.getTime() / 90000) * 5
      };

      setCurrentData(newData);

      // Update chart data (keep last 20 points)
      setChartData(prev => {
        const updated = [...prev, newData];
        return updated.slice(-20);
      });

      // Occasionally add table entries
      if (Math.random() < 0.3) {
        const devices = ['ESP32-001', 'ESP32-002', 'ESP32-003'];
        const statuses: DataEntry['status'][] = ['online', 'online', 'online', 'warning', 'offline'];
        
        const newEntry: DataEntry = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: now.toLocaleString(),
          device: devices[Math.floor(Math.random() * devices.length)],
          temperature: Math.round(newData.temperature * 10) / 10,
          humidity: Math.round(newData.humidity),
          pressure: Math.round(newData.pressure * 100) / 100,
          status: statuses[Math.floor(Math.random() * statuses.length)]
        };

        setTableData(prev => {
          const updated = [newEntry, ...prev];
          return updated.slice(0, 10); // Keep last 10 entries
        });
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    currentData,
    chartData,
    tableData
  };
}
