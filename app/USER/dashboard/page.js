"use client";

import { useState, useEffect } from "react";

export default function UserDashboard() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Load userId from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (!storedId) {
      alert("User not logged in. Please login again.");
      setTicketsLoading(false);
      return;
    }
    setUserId(storedId);
  }, []);

  // Fetch services
  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => setServices(data.services || []))
      .catch(console.error);
  }, []);

  // Fetch tickets
  useEffect(() => {
    if (!userId) return;

    setTicketsLoading(true);
    fetch(`/api/tickets/user/${parseInt(userId, 10)}`)
      .then(res => res.json())
      .then(data => {
        setTickets(data.tickets || []);
        console.log("Fetched tickets from API:", data);  // <-- add this
      })
      .catch(console.error)
      .finally(() => setTicketsLoading(false));
  }, [userId]);

  async function handleTicketCreate() {
    if (!serviceId) return alert("Please select a service.");

    setLoading(true);
    try {
      const res = await fetch("/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          customerPriority: priority,
          userId: parseInt(userId, 10),
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (!data.success) return alert(data.error);

      alert(`🎉 Ticket Created! Ticket No: ${data.ticket.id}`);
      setServiceId("");
      setPriority("NORMAL");
      setTickets(prev => [data.ticket, ...prev]);
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Something went wrong.");
    }
  }

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === "COMPLETED").length;
  const pendingTickets = tickets.filter(t => t.status === "PENDING").length;
  const inProgressTickets = tickets.filter(t => t.status === "IN_PROGRESS").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setUserId(null);
    setTickets([]);
    window.location.href = "/login";
  };

  if (!userId && !ticketsLoading) return <p>Please log in to view your dashboard.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-4">Citizen Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded hover:bg-red-700">Logout</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-500">Total Tickets</p>
          <p className="text-2xl font-bold">{totalTickets}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressTickets}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedTickets}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingTickets}</p>
        </div>
      </div>

      {/* Ticket Creation Form */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Create a New Ticket</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Select Service</label>
            <select className="border p-2 w-full rounded" value={serviceId} onChange={e => setServiceId(e.target.value)}>
              <option value="">-- Choose a Service --</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (${s.price || 0})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Priority</label>
            <select className="border p-2 w-full rounded" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="NORMAL">Normal</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <button onClick={handleTicketCreate} disabled={loading} className="bg-blue-600 text-white p-3 w-full rounded hover:bg-blue-700">
            {loading ? "Creating Ticket..." : "Generate Ticket"}
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
        {ticketsLoading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p>No tickets created yet.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map(t => (
              <div key={t.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">Ticket #{t.id}</p>
                  <p>Service: {t.serviceName}</p>
                  <p>Priority: {t.customerPriority}</p>
                  <p>Created: {new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full font-medium ${getStatusColor(t.status)}`}>
                  {t.status.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
