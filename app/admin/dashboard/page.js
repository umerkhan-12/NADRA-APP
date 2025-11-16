"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load admin user from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    if (!storedId || role !== "ADMIN") {
      alert("Admin not logged in");
      window.location.href = "/login";
      return;
    }
    setUserId(storedId);
  }, []);

  // Helper function to fetch JSON safely
  const fetchJSON = async (url) => {
    try {
      const res = await fetch(`${window.location.origin}${url}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Fetch error:", url, err);
      return {};
    }
  };

  // Fetch all data safely
  useEffect(() => {
    if (!userId) return;

    const fetchAllData = async () => {
      setLoading(true);

      const [ticketsRes, usersRes, servicesRes, agentsRes, paymentsRes, logsRes] =
        await Promise.all([
          fetchJSON("/api/admin/tickets"),
          fetchJSON("/api/admin/users"),
          fetchJSON("/api/admin/services"),
          // fetchJSON("/api/admin/agents"),
          fetchJSON("/api/admin/payments"),
          fetchJSON("/api/admin/logs"),
        ]);

      setTickets(ticketsRes.tickets || []);
      setUsers(usersRes?.users || []);
      setServices(servicesRes.services || []);
      // setAgents(agentsRes.agents || []);
       setPayments(paymentsRes?.payments || []);
         setLogs(logsRes?.logs || []);

      // setLogs(logsRes.logs || []);

      setLoading(false);
    };

    fetchAllData();
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (!userId) return <p>Redirecting to login...</p>;
  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NADRA Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-500">Total Tickets</p>
          <p className="text-2xl font-bold">{tickets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-500">Total Agents</p>
          <p className="text-2xl font-bold">{agents.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-500">Pending Payments</p>
          <p className="text-2xl font-bold">
            {payments.filter((p) => p.status === "PENDING").length}
          </p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Tickets</h2>
        {tickets.length === 0 ? (
          <p>No tickets available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">User</th>
                  <th className="px-4 py-2 border">Service</th>
                  <th className="px-4 py-2 border">Priority</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Created At</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{t.id}</td>
                    <td className="px-4 py-2 border">{t.userName || t.user?.Name}</td>
                    <td className="px-4 py-2 border">{t.serviceName || t.service?.name}</td>
                    <td className="px-4 py-2 border">{t.customerPriority}</td>
                    <td className="px-4 py-2 border">{t.status}</td>
                    <td className="px-4 py-2 border">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
        {logs.length === 0 ? (
          <p>No logs available.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((l) => (
              <li key={l.id} className="border p-2 rounded hover:bg-gray-50">
                <span className="font-medium">Ticket #{l.ticketId}:</span> {l.message}{" "}
                <span className="text-gray-400 text-sm">
                  ({new Date(l.createdAt).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
