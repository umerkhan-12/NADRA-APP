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
        console.log("Fetched tickets from API:", data);  
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
  <div className="flex min-h-screen bg-gray-100">

    {/* ---------------------- LEFT SIDEBAR ---------------------- */}
    <aside className="w-64 bg-white shadow-xl border-r p-6 flex flex-col">
      <img
        src="/logo.png"
        alt="NADRA Logo"
        className="w-32 mx-auto mb-4"
      />

      <h2 className="text-xl font-bold text-center text-green-700">NADRA Citizen Portal</h2>

      {/* User Info + Logout Button */}
      <div className="mt-8 bg-gray-50 p-4 rounded-xl shadow-sm">
        {/* <p className="font-semibold text-gray-700 text-center">👤 {localStorage.getItem("userName")}</p> */}
        <p className="text-gray-500 text-center">User ID: {userId}</p>
        <p className="text-gray-500 text-center capitalize">Role: {localStorage.getItem("role")}</p>

        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </aside>

    {/* ---------------------- MAIN CONTENT ---------------------- */}
    <div className="flex-1 p-8">

      {/* ---------------------- HEADER ---------------------- */}
      <header className="bg-green-700 text-white p-5 rounded-xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold tracking-wide">Citizen Dashboard</h1>
        <p className="text-sm text-green-100 mt-1">Manage your services and tickets easily</p>
      </header>

      {/* ---------------------- STAT CARDS ---------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-5 rounded-2xl shadow flex items-center gap-4 hover:scale-105 transition">
          <div className="p-4 bg-green-100 rounded-xl">📄</div>
          <div>
            <p className="text-gray-500">Total Tickets</p>
            <p className="text-3xl font-bold">{totalTickets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow flex items-center gap-4 hover:scale-105 transition">
          <div className="p-4 bg-blue-100 rounded-xl">⚙️</div>
          <div>
            <p className="text-gray-500">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{inProgressTickets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow flex items-center gap-4 hover:scale-105 transition">
          <div className="p-4 bg-green-100 rounded-xl">✔️</div>
          <div>
            <p className="text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedTickets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow flex items-center gap-4 hover:scale-105 transition">
          <div className="p-4 bg-yellow-100 rounded-xl">⏳</div>
          <div>
            <p className="text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingTickets}</p>
          </div>
        </div>

      </div>

      {/* ---------------------- TICKET CREATION ---------------------- */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Create a New Ticket</h2>

        {/* Your existing form (unchanged) */}
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

          <button
            onClick={handleTicketCreate}
            disabled={loading}
            className="bg-green-700 text-white p-3 w-full rounded hover:bg-green-800 transition"
          >
            {loading ? "Creating Ticket..." : "Generate Ticket"}
          </button>
        </div>
      </div>

      {/* ---------------------- TICKET LIST (UPGRADED) ---------------------- */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">My Tickets</h2>

        {ticketsLoading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p>No tickets created yet.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map(t => (
              <div
                key={t.id}
                className="
                  border rounded-xl p-5 shadow-sm hover:shadow-md
                  transition bg-gray-50 flex justify-between items-center
                "
                style={{
                  borderLeft: `6px solid ${
                    t.status === "COMPLETED"
                      ? "#16A34A"
                      : t.status === "IN_PROGRESS"
                      ? "#2563EB"
                      : "#EAB308"
                  }`,
                }}
              >
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    🎫 Ticket #{t.id}
                  </p>
                  <p className="text-gray-600">🛠 Service: {t.serviceName}</p>
                  <p className="text-gray-600">⚡ Priority: {t.customerPriority}</p>
                  <p className="text-gray-500 text-sm">
                    📅 Created: {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-full font-medium text-sm ${getStatusColor(
                    t.status
                  )}`}
                >
                  {t.status.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  </div>
);
}