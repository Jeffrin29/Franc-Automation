import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export function useLiveData() {
  const [currentData, setCurrentData] = useState<any>({
    temperature: 0,
    humidity: 0,
    pressure: 1013,
    timestamp: "--",
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const socketRef = useRef<any>(null);

  // Fetch initial latest data
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const res = await fetch(`${API}/api/data/latest`);
        const latest = await res.json();
        if (latest && latest.temperature) {
          setCurrentData(latest);
          setChartData([latest]);
          setTableData([latest]);
        }
      } catch (err) {
        console.error("[ERROR] Fetching initial data:", err);
      }
    };
    loadInitial();
  }, []);

  // Connect to Socket.IO
  useEffect(() => {
    socketRef.current = io(API);

    socketRef.current.on("connect", () => {
      console.log("[Socket.IO] Connected to backend");
    });

    socketRef.current.on("update_data", (data: any) => {
      console.log("[Socket.IO] Received update:", data);
      setCurrentData(data);
      setChartData((prev) => [...prev.slice(-49), data]); // keep last 50 points
      setTableData((prev) => [data, ...prev.slice(0, 19)]); // keep last 20 records
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return { currentData, chartData, tableData };
}
