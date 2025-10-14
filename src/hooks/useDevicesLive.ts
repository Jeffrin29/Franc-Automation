import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export function useDevicesLive() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);

  // Fetch devices from backend
  const loadDevices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/devices`);
      const data = await res.json();
      setDevices(data || []);
    } catch (error) {
      console.error("[ERROR] Loading devices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();

    // Connect to Socket.IO
    socketRef.current = io(API);

    socketRef.current.on("connect", () => {
      console.log("[Socket.IO] Connected for device updates");
    });

    // Listen for backend-emitted updates
    socketRef.current.on("update_data", (data: any) => {
      console.log("[Socket.IO] Device update received:", data);

      // Update device list dynamically
      setDevices((prev) => {
        const idx = prev.findIndex((d) => d.id === data.device_id || d.name === data.device_name);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            temperature: data.temperature,
            humidity: data.humidity,
            lastSeen: data.timestamp,
            status: "online",
          };
          return updated;
        } else {
          // If new device, append
          return [
            ...prev,
            {
              id: data.device_id || Math.random(),
              name: data.device_name || "Unknown",
              temperature: data.temperature,
              humidity: data.humidity,
              lastSeen: data.timestamp,
              status: "online",
            },
          ];
        }
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return { devices, loading, reload: loadDevices };
}
