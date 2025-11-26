"use client";

import {
  Activity,
  BarChart3,
  Database,
  Settings,
  Wifi,
  Users,
  ShieldCheck,
  Radar,
  LayoutDashboard,
  FolderKanban,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// --------------------------------------
// Types
// --------------------------------------
interface SidebarItem {
  name: string;
  icon: any;
  path: string;
  roles?: string[];
}

interface SidebarSection {
  title: string;
  roles: string[];
  items: SidebarItem[];
}

// --------------------------------------
// Sections with Role Rules
// --------------------------------------
const ALL_SECTIONS: SidebarSection[] = [
  {
    title: "Dashboard",
    roles: ["superadmin", "admin", "user"],
    items: [
      { name: "Dashboard", icon: BarChart3, path: "/dashboard" },
      { name: "Dashboard Builder", icon: LayoutDashboard, path: "/dashboard-builder" },
      { name: "Dashboards", icon: FolderKanban, path: "/dashboards" },
    ],
  },

  {
    title: "Data Monitoring",
    roles: ["superadmin", "admin", "user"],
    items: [
      { name: "Live Data", icon: Activity, path: "/live" },
      { name: "History", icon: Database, path: "/history" },
    ],
  },

  {
    title: "Device Management",
    roles: ["superadmin", "admin", "user"],
    items: [
      { name: "Devices", icon: Wifi, path: "/devices" },
      { name: "Sensors", icon: Radar, path: "/sensors" },
    ],
  },

  {
    title: "Users & Roles",
    roles: ["superadmin", "admin"],
    items: [
      { name: "User Management", icon: Users, path: "/users", roles: ["superadmin"] },
      { name: "Role Management", icon: ShieldCheck, path: "/roles", roles: ["superadmin"] },
    ],
  },

  {
    title: "Administration",
    roles: ["superadmin", "admin"],
    items: [{ name: "Settings", icon: Settings, path: "/settings" }],
  },
];

// --------------------------------------
// Sidebar Component
// --------------------------------------
export default function Sidebar() {
  const location = useLocation();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setRole(JSON.parse(user).role);
  }, []);

  return (
    <div className="w-64 h-screen bg-[#0d1117] border-r border-gray-800 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Franc Automation</h1>
            <p className="text-xs text-gray-400">Real-time Monitoring</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {ALL_SECTIONS.filter(section => section.roles.includes(role)).map(section => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
              {section.title}
            </h2>

            <ul className="space-y-1">
              {section.items
                .filter(item => !item.roles || item.roles.includes(role))
                .map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        )}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
