"use client";
import DashboardLayout from "@/components/ui/DashboardLayout";

export default function AgentDashboard() {
  return (
    <DashboardLayout title="Agent Dashboard">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600">Assigned Tickets</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600">Pending</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600">Completed</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

      </div>

      <div className="mt-10 bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Tickets Assigned to You</h3>
        <p className="text-gray-500">No assigned tickets yet.</p>
      </div>

    </DashboardLayout>
  );
}
