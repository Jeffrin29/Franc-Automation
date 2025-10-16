"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const DashboardBuilder: React.FC = () => {
  const [widgetType, setWidgetType] = useState<string>("");

  return (
    <DashboardLayout>  
   <div className="p-6 text-gray-200 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center mb-2">
          <i className="bi bi-layout-text-window-reverse text-blue-500 mr-2"></i>{" "}
          Dashboard Builder
        </h2>
        <p className="text-gray-400">
          Create and customize IoT dashboards with drag-and-drop widgets. Assign
          dashboards to users and devices for real-time monitoring.
        </p>
      </div>

      {/* Dashboard Info Card */}
      <div className="bg-gray-800 shadow-md rounded-lg mb-6 border border-gray-700">
        <div className="border-b border-gray-700 px-4 py-3">
          <span className="font-semibold text-gray-100 flex items-center">
            <i className="bi bi-info-circle text-blue-400 mr-2"></i> Dashboard
            Info
          </span>
        </div>
        <div className="p-4">
          <form className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                <i className="bi bi-fonts mr-1"></i> Dashboard Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Factory Floor"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                <i className="bi bi-card-text mr-1"></i> Description
              </label>
              <input
                type="text"
                placeholder="Short description"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                <i className="bi bi-person mr-1"></i> Assign to User{" "}
                <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select user</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      {/* Add Widget Card */}
      <div className="bg-gray-800 shadow-md rounded-lg mb-6 border border-gray-700">
        <div className="border-b border-gray-700 px-4 py-3">
          <span className="font-semibold text-gray-100 flex items-center">
            <i className="bi bi-plus-circle text-blue-400 mr-2"></i> Add Widget
          </span>
        </div>
        <div className="p-4">
          <form className="grid md:grid-cols-4 gap-4">
            {/* Widget Type */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                <i className="bi bi-bar-chart mr-1"></i> Chart Type{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={widgetType}
                onChange={(e) => setWidgetType(e.target.value)}
              >
                <option value="">Select type</option>
                <option value="line">Line Chart</option>
                <option value="gauge">Gauge</option>
                <option value="pressure_chart">Pressure Chart</option>
                <option value="temperature_chart">Temperature Chart</option>
                <option value="table">Table</option>
                <option value="onoff">On/Off Button</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                <i className="bi bi-type mr-1"></i> Title
              </label>
              <input
                type="text"
                placeholder="Widget title (optional)"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Device */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                <i className="bi bi-cpu mr-1"></i> Device{" "}
                <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select device</option>
              </select>
            </div>

            {/* Sensor */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                <i className="bi bi-activity mr-1"></i> Sensor{" "}
                <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select sensor</option>
              </select>
            </div>
          </form>

          {/* Conditional Config Sections */}
          {widgetType === "table" && (
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-1">
                <i className="bi bi-table mr-1"></i> Table Columns
              </label>
              <input
                type="text"
                placeholder="e.g. timestamp,value"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {widgetType === "onoff" && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  <i className="bi bi-broadcast mr-1"></i> MQTT Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. /device/relay"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  <i className="bi bi-toggle-on mr-1"></i> On Payload
                </label>
                <input
                  type="text"
                  placeholder="e.g. ON"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  <i className="bi bi-toggle-off mr-1"></i> Off Payload
                </label>
                <input
                  type="text"
                  placeholder="e.g. OFF"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  <i className="bi bi-ui-checks-grid mr-1"></i> Button Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toggle"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              <i className="bi bi-plus-lg mr-1"></i> Add Widget
            </button>
            <button
              type="button"
              className="ml-3 border border-gray-500 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-md"
            >
              <i className="bi bi-eye mr-1"></i> Preview Widget
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets Section */}
      <div className="mb-6">
        <h5 className="font-semibold mb-3 flex items-center text-gray-100">
          <i className="bi bi-grid-3x3-gap mr-2"></i> Dashboard Widgets
        </h5>
        <div className="grid md:grid-cols-3 gap-4" id="dashboard-widgets">
          {/* Widget previews will go here later */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-500">
            No widgets added yet
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-lg font-semibold">
          <i className="bi bi-save mr-1"></i> Save Dashboard
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default DashboardBuilder;
