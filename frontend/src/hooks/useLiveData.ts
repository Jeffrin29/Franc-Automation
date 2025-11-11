// ==============================================
// useLiveData.ts (Stable Anti-Flicker Version)
// ==============================================
"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// -------------------------------
// Types
// -------------------------------
export interface SensorData {
  device_name?: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  status?: "online" | "offline" | "warning";
  timestamp: string;
  deviceConnected?: boolean;
  isConnected?: boolean;
  devicesOnline?: number;
  device_id?: string | number;
}

// -------------------------------
// Helper: format India time
// -------------------------------
function formatIndiaTime(value?: string | number | Date): string {
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

// -------------------------------
// Hook: useLiveData
// -------------------------------
export function useLiveData(page: "dashboard" | "live" = "dashboard") {
  const [currentData, setCurrentData] = useState<SensorData>({
    temperature: null,
    humidity: null,
    pressure: null,
    timestamp: "--",
    status: "offline",
    deviceConnected: false,
  });

  const [chartData, setChartData] = useState<SensorData[]>([]);
  const [tableData, setTableData] = useState<SensorData[]>([]);
  const [connected, setConnected] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const offlineTimerRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------
  // 🔌 Real-time updates via Socket.IO
  // -------------------------------
  useEffect(() => {
    const socket = io(API, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket.IO] ✅ Connected");
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket.IO] ⚠️ Disconnected:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket.IO] ❌ Connection error:", err.message);
      setConnected(false);
    });

    // 🧠 Unified handler for all data events
    const handlePayload = (data: any) => {
      if (!data) return;
      const online = data.status === "online" || (data.devices_online ?? 0) > 0;

      const formatted: SensorData = {
        device_name: data.device_name || "Device",
        temperature: online ? data.temperature ?? null : currentData.temperature,
        humidity: online ? data.humidity ?? null : currentData.humidity,
        pressure: online ? data.pressure ?? null : currentData.pressure,
        timestamp: formatIndiaTime(data.timestamp || new Date()),
        status: online ? "online" : "offline",
        deviceConnected: online,
        isConnected: online,
        devicesOnline: data.devices_online ?? (online ? 1 : 0),
        device_id: data.device_id,
      };

      lastUpdateRef.current = Date.now();
      setCurrentData(formatted);
      setIsDeviceConnected(online);

      if (online) {
        setChartData((prev) => [...prev.slice(-49), formatted]);
        setTableData((prev) => [formatted, ...prev.slice(0, 19)]);
      }

      // Reset offline timeout only when no new data comes for 8s
      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = setTimeout(() => {
        const diff = Date.now() - lastUpdateRef.current;
        if (diff > 8000) {
          setIsDeviceConnected(false);
          setCurrentData((prev) => ({
            ...prev,
            status: "offline",
            temperature: null,
            humidity: null,
            pressure: null,
            timestamp: "--",
          }));
        }
      }, 9000);
    };

    ["sensor_data", "device_data_update", "dashboard_update"].forEach((ev) =>
      socket.on(ev, handlePayload)
    );

    socket.on("device_status", (data: any) => {
      if (!data) return;
      const diff = Date.now() - lastUpdateRef.current;
      if (data.status === "offline" && diff > 8000) {
        setIsDeviceConnected(false);
      }
    });

    socket.on("mqtt_status", (data: any) => {
      if (!data) return;
      const diff = Date.now() - lastUpdateRef.current;
      if (data.status === "disconnected" && diff > 8000) {
        setIsDeviceConnected(false);
      }
    });

    return () => {
      socket.disconnect();
      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
    };
  }, []);

  // -------------------------------
  // 🕒 Poll Fallback (ONLY for Live Page)
  // -------------------------------
  useEffect(() => {
    if (page !== "live") return; // ✅ No polling for dashboard

    const loadLatest = async () => {
      try {
        const res = await fetch(`${API}/api/data/latest`);
        if (!res.ok) return;
        const latest = await res.json();
        if (!latest) return;

        const online =
          latest.status === "online" || (latest.devices_online ?? 0) > 0;

        const formatted: SensorData = {
          ...latest,
          device_name: latest.device_name || "Device",
          temperature: online ? latest.temperature ?? null : currentData.temperature,
          humidity: online ? latest.humidity ?? null : currentData.humidity,
          pressure: online ? latest.pressure ?? null : currentData.pressure,
          timestamp: formatIndiaTime(latest.timestamp || new Date()),
          status: online ? "online" : "offline",
          deviceConnected: online,
          isConnected: online,
          devicesOnline: latest.devices_online || 0,
        };

        if (online) {
          lastUpdateRef.current = Date.now();
          setCurrentData(formatted);
          setChartData((prev) => [...prev.slice(-49), formatted]);
          setTableData((prev) => [formatted, ...prev.slice(0, 19)]);
          setIsDeviceConnected(true);
        }
      } catch (err) {
        console.error("[useLiveData] ❌ Polling error:", err);
      }
    };

    loadLatest();
    const interval = setInterval(loadLatest, 5000);
    return () => clearInterval(interval);
  }, [page]);

  // -------------------------------
  // ✅ Unified output
  // -------------------------------
  return {
    currentData,
    chartData,
    tableData,
    connected,
    isDeviceConnected,
  };
}
