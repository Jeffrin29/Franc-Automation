"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Thermometer,
  Server,
  IdCard,
  Settings,
  Save,
  Trash,
  X,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate } from 'react-router-dom';

const API_URL = "http://127.0.0.1:5000/api"; // ✅ Update if backend hosted elsewhere

const Sensors: React.FC = () => {
  const navigate = useNavigate(); // ✅ Initialize router
  const [sensors, setSensors] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSensor, setEditSensor] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // ✅ Fetch sensors and devices from backend
  useEffect(() => {
    fetchSensors();
    fetchDevices();
  }, []);

  const fetchSensors = async () => {
    try {
      const res = await fetch(`${API_URL}/sensors`);
      const data = await res.json();
      setSensors(data);
    } catch (err) {
      console.error("❌ Error fetching sensors:", err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${API_URL}/devices`);
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error("❌ Error fetching devices:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editSensor?.id ? "PUT" : "POST";
    const url = editSensor?.id
      ? `${API_URL}/sensors/${editSensor.id}`
      : `${API_URL}/sensors`;

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editSensor.name,
          friendly_name: editSensor.friendly_name,
          device_id: editSensor.device_id,
        }),
      });
      setModalOpen(false);
      fetchSensors();
    } catch (err) {
      console.error("❌ Error saving sensor:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API_URL}/sensors/${editSensor.id}`, {
        method: "DELETE",
      });
      setDeleteModal(false);
      fetchSensors();
    } catch (err) {
      console.error("❌ Error deleting sensor:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-950 text-gray-100 px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Thermometer className="text-green-400 mr-2" /> Sensor Management
          </h2>
          <div className="flex gap-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setEditSensor({});
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2" /> Add Sensor
            </Button>

            {/* ✅ Updated Manage Devices Button */}
            <Button
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-900"
              onClick={() => navigate("/devices")} // ✅ redirect to /devices
            >
              <Server className="mr-2" /> Manage Devices
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="font-semibold flex items-center">
                <RefreshCw className="text-green-400 mr-2" /> Sensor Discovery
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-900/40 p-4 rounded-lg text-blue-200">
                Sensors are auto-discovered from MQTT device responses.
                <br /> Assign or edit friendly names below.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="font-semibold flex items-center">
                <Thermometer className="text-green-400 mr-2" /> All Sensors
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-gray-300 border-b border-gray-700">
                  <tr>
                    <th className="text-left py-2">
                      <IdCard className="inline mr-1" /> Name
                    </th>
                    <th className="text-left py-2">
                      <Server className="inline mr-1" /> Device
                    </th>
                    <th className="text-left py-2">Friendly Name</th>
                    <th className="text-left py-2">
                      <Settings className="inline mr-1" /> Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-gray-400 py-4 italic"
                      >
                        No sensors found.
                      </td>
                    </tr>
                  ) : (
                    sensors.map((s) => (
                      <tr key={s.id} className="border-b border-gray-800">
                        <td className="py-2">{s.name}</td>
                        <td className="py-2">{s.device_name}</td>
                        <td className="py-2">{s.friendly_name}</td>
                        <td className="py-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-400 text-blue-400 hover:bg-blue-900"
                            onClick={() => {
                              setEditSensor(s);
                              setModalOpen(true);
                            }}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-900"
                            onClick={() => {
                              setEditSensor(s);
                              setDeleteModal(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-md border border-gray-700"
            >
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Thermometer className="text-blue-400 mr-2" />{" "}
                {editSensor?.id ? "Edit Sensor" : "Add Sensor"}
              </h3>
              <form onSubmit={handleSave}>
                <div className="space-y-3">
                  <Input
                    placeholder="Sensor Name"
                    value={editSensor?.name || ""}
                    onChange={(e) =>
                      setEditSensor({ ...editSensor, name: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-gray-100"
                    required
                  />
                  <Select
                    onValueChange={(val) =>
                      setEditSensor({ ...editSensor, device_id: val })
                    }
                    value={editSensor?.device_id || ""}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                      <span>
                        {devices.find((d) => d.id === editSensor?.device_id)
                          ?.name || "Select Device"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Friendly Name"
                    value={editSensor?.friendly_name || ""}
                    onChange={(e) =>
                      setEditSensor({
                        ...editSensor,
                        friendly_name: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-gray-100"
                  />
                </div>
                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    <X className="mr-1" /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="mr-1" /> Save
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-6 rounded-xl border border-gray-700 w-[90%] max-w-md"
            >
              <h3 className="text-lg font-semibold flex items-center text-red-400 mb-4">
                <AlertTriangle className="mr-2" /> Delete Sensor
              </h3>
              <p className="text-gray-300 mb-2">
                Are you sure you want to delete this sensor?
              </p>
              <div className="font-semibold text-gray-100 mb-4">
                {editSensor?.name}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDelete}
                >
                  <Trash className="mr-1" /> Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sensors;
