import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Dashboards: React.FC = () => {
  return (
    <DashboardLayout>
    <div className="p-6 text-gray-100 bg-[#0B0B0F] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <i className="bi bi-kanban text-blue-500"></i> Dashboards
          </h2>
          <p className="text-gray-400 mt-1">
            Manage all dashboards and templates. Create, edit, duplicate, assign, or save as template.
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <i className="bi bi-plus-lg"></i> New Dashboard
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-800 flex items-center gap-2">
            <i className="bi bi-layers"></i> Templates
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-[#141418] border border-gray-700 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="bg-[#1E1E24] text-gray-400 uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Name</th>
                  <th scope="col" className="px-6 py-3 font-medium">Description</th>
                  <th scope="col" className="px-6 py-3 font-medium">Type</th>
                  <th scope="col" className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Table data will be fetched dynamically later */}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal placeholder (for later backend integration) */}
      <div
        id="dashboardActionModal"
        className="hidden fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center"
      >
        <div className="bg-[#1E1E24] rounded-xl shadow-lg w-[90%] md:w-[400px]">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-t-xl flex justify-between items-center">
            <h5 className="font-semibold">Dashboard Action</h5>
            <button className="text-white text-xl">&times;</button>
          </div>
          <div id="dashboard-action-modal-body" className="p-4 text-gray-300">
            {/* Dynamic content will load here */}
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default Dashboards;
