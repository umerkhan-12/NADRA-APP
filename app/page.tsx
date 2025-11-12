import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Ticket, UserCog, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-4">NADRA Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-gray-600">Total Tickets</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <Ticket className="w-10 h-10 text-gray-500" />
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-gray-600">Registered Users</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <Users className="w-10 h-10 text-gray-500" />
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-gray-600">Available Agents</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <UserCog className="w-10 h-10 text-gray-500" />
          </CardContent>
        </Card>
      </div>

      {/* Ticket Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ticket Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-700">Open Tickets</p>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-700">In Progress</p>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-700">Closed Tickets</p>
                <span className="font-bold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col space-y-4">
              <Button className="w-full">Create New Ticket</Button>
              <Button className="w-full" variant="outline">View Users</Button>
              <Button className="w-full" variant="outline">Manage Agents</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Summary */}
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">System Summary</h2>
          <p className="text-gray-600 leading-relaxed">
            This NADRA Management Dashboard displays an overview of system activity including ticket
            counts, user registrations, and agent availability. Since no data has been added yet,
            all values are currently set to 0. As soon as you add customers, agents, and service
            tickets, the dashboard metrics will update automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}