import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// Time formatter (India)
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

export function useDevicesLive() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  // ------------------------------
  // Fetch device list from backend
  // ------------------------------
  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/devices`);
      const data = await res.json();
      setDevices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[useDevicesLive] ❌ Error loading devices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------
  // Update or add device
  // ------------------------------
  const updateDevice = (incoming: any) => {
    if (!incoming) return;
    setDevices((prev) => {
      const idx = prev.findIndex(
        (d) => d.id === incoming.device_id || d.name === incoming.device_name
      );

      const updatedDevice = {
        ...prev[idx],
        id: incoming.device_id || prev[idx]?.id || Math.random(),
        name: incoming.device_name || prev[idx]?.name || "Unknown Device",
        temperature: incoming.temperature ?? prev[idx]?.temperature ?? null,
        humidity: incoming.humidity ?? prev[idx]?.humidity ?? null,
        pressure: incoming.pressure ?? prev[idx]?.pressure ?? null,
        status: incoming.status || "online",
        lastSeen: formatIndiaTime(incoming.timestamp || new Date()),
        is_connected: incoming.status === "online",
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedDevice;
        return copy;
      } else {
        return [...prev, updatedDevice];
      }
    });
  };

  // ------------------------------
  // Socket.IO setup
  // ------------------------------
  useEffect(() => {
    loadDevices();

    const socket = io(API, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket.IO] ✅ Connected for device updates");
    });

    socket.on("disconnect", () => {
      console.warn("[Socket.IO] ⚠️ Disconnected from backend");
    });

    // 🟢 Handle unified payloads from backend
    const handleUpdate = (data: any) => {
      if (!data) return;
      updateDevice(data);
    };

    // Bind to all relevant events
    socket.on("sensor_data", handleUpdate);
    socket.on("device_data_update", handleUpdate);
    socket.on("dashboard_update", handleUpdate);

    // 🔴 Handle explicit offline events
    socket.on("device_status", (data: any) => {
      if (!data?.device_id) return;
      setDevices((prev) =>
        prev.map((d) =>
          d.id === data.device_id
            ? {
                ...d,
                status: data.status || "offline",
                is_connected: data.status === "online",
                lastSeen: formatIndiaTime(data.last_seen || new Date()),
              }
            : d
        )
      );
    });

    // MQTT global status (update all to offline if disconnected)
    socket.on("mqtt_status", (data: any) => {
      if (data?.status === "disconnected") {
        setDevices((prev) =>
          prev.map((d) => ({
            ...d,
            status: "offline",
            is_connected: false,
          }))
        );
      }
    });

    return () => {
      socket.disconnect();
      console.log("[Socket.IO] 🔌 Disconnected cleanly");
    };
  }, [loadDevices]);

  return { devices, loading, reload: loadDevices };
}
