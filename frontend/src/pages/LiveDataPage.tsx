"use client";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLiveData, SensorData } from "@/hooks/useLiveData";
import { Wifi, WifiOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// ✅ Helper: format India time
function formatIndiaTime(value?: string | number | Date) {
  if (!value) return "--";
  const date = new Date(value);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export default function LiveDataPage() {
  // ✅ Specify mode "live" so hook enables safe API polling
  const { tableData, isDeviceConnected, currentData } = useLiveData("live");

  const [lastUpdated, setLastUpdated] = useState<string>("--");
  const [localTable, setLocalTable] = useState<SensorData[]>([]);
  const [isOnline, setIsOnline] = useState(false);

  // Track update and handle fallback offline status
  const lastUpdateRef = useRef<number>(Date.now());
  const offlineTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Sync socket updates directly from hook data
  useEffect(() => {
    if (tableData.length > 0 && isDeviceConnected) {
      setLocalTable(tableData);
      setIsOnline(true);
      lastUpdateRef.current = Date.now();

      // Reset timer for offline detection
      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = setTimeout(() => {
        const diff = Date.now() - lastUpdateRef.current;
        if (diff > 8000) setIsOnline(false);
      }, 9000);
    }
  }, [tableData, isDeviceConnected]);

  // ✅ Update last updated label when live data changes
  useEffect(() => {
    if (currentData?.timestamp && isDeviceConnected) {
      setLastUpdated(formatIndiaTime(currentData.timestamp));
      lastUpdateRef.current = Date.now();
    }
  }, [currentData, isDeviceConnected]);

  // ✅ Add safe polling fallback — handles missed socket packets
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/data/latest`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;

        const online = data.status === "online" || (data.devices_online ?? 0) > 0;
        if (online) {
          setIsOnline(true);
          lastUpdateRef.current = Date.now();
        }

        const formatted: SensorData = {
          device_name: data.device_name || "—",
          temperature: online ? data.temperature ?? null : null,
          humidity: online ? data.humidity ?? null : null,
          pressure: online ? data.pressure ?? null : null,
          status: online ? "online" : "offline",
          timestamp: formatIndiaTime(data.timestamp || new Date()),
          deviceConnected: online,
          isConnected: online,
          devicesOnline: data.devices_online || 1,
          device_id: data.device_id,
        };

        setLocalTable((prev) => {
          if (prev.length === 0 || prev[0].timestamp !== formatted.timestamp) {
            return [formatted, ...prev.slice(0, 19)];
          }
          return prev;
        });

        // Auto mark offline after 8 seconds if no updates
        if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
        offlineTimerRef.current = setTimeout(() => {
          const diff = Date.now() - lastUpdateRef.current;
          if (diff > 8000) setIsOnline(false);
        }, 9000);
      } catch (err) {
        console.error("[LiveDataPage] polling error:", err);
      }
    }, 5000); // Poll every 5 seconds instead of 2 to reduce flicker

    return () => {
      clearInterval(interval);
      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
    };
  }, []);

  // ✅ Helper: status badge color mapping
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      online: "bg-metric-good text-foreground",
      offline: "bg-metric-critical text-foreground",
      warning: "bg-metric-warning text-foreground",
    };
    return (
      <Badge className={variants[status] || "bg-muted text-foreground"}>
        {status || "unknown"}
      </Badge>
    );
  };

  // ✅ Render UI
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">📡 Live Device Data</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5 text-metric-good" />
              <span className="text-sm text-muted-foreground">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-metric-critical" />
              <span className="text-sm text-muted-foreground">
                Disconnected
              </span>
            </>
          )}
        </div>
      </div>

      {/* Table Section */}
      <Card className="bg-gradient-card border-border">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Sensor Readings</h3>
          <span className="text-sm text-muted-foreground">
            Showing latest {localTable.length || 0} readings
          </span>
        </div>

        <div className="p-6 overflow-x-auto">
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
              {isOnline && localTable.length > 0 ? (
                localTable.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">
                      {formatIndiaTime(entry.timestamp)}
                    </TableCell>
                    <TableCell>{entry.device_name || "—"}</TableCell>
                    <TableCell>
                      {entry.temperature != null
                        ? `${entry.temperature}°C`
                        : "--"}
                    </TableCell>
                    <TableCell>
                      {entry.humidity != null
                        ? `${entry.humidity}%`
                        : "--"}
                    </TableCell>
                    <TableCell>
                      {entry.pressure != null
                        ? `${entry.pressure} hPa`
                        : "--"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry.status || "offline")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <p className="text-muted-foreground">
                      {isOnline
                        ? "Waiting for live data..."
                        : "No active device connection."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
