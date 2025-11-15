"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * AdminDashboard.jsx
 * - Modern admin dashboard using localStorage auth (role check)
 * - Features: view tickets, assign agents, update status, manage services/users/agents,
 *   search & filter, export CSV, basic analytics summary.
 *
 * NOTE: adapt API endpoints as needed to match your backend.
 */

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const PRIORITY_OPTIONS = ["LOW", "NORMAL", "MEDIUM", "HIGH", "URGENT"];

export default function AdminDashboard() {
  // AUTH: check role
  const storedRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const [authorized, setAuthorized] = useState(storedRole === "ADMIN");

  // Data
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [pageSize, setPageSize] = useState(25);

  // Modals & forms
  const [assignModal, setAssignModal] = useState({ open: false, ticketId: null });
  const [editServiceModal, setEditServiceModal] = useState({ open: false, service: null });
  const [editUserModal, setEditUserModal] = useState({ open: false, user: null });
  const [editAgentModal, setEditAgentModal] = useState({ open: false, agent: null });

  const [processingId, setProcessingId] = useState(null);

  // Analytics quick counts (memoized)
  const stats = useMemo(() => {
    const total = tickets.length;
    const completed = tickets.filter(t => t.status === "COMPLETED").length;
    const pending = tickets.filter(t => t.status === "PENDING").length;
    const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length;
    const highPriority = tickets.filter(t => t.finalPriority >= 3).length;
    return { total, completed, pending, inProgress, highPriority };
  }, [tickets]);

  // ---------- Load all data ----------
  useEffect(() => {
    if (!authorized) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  async function loadAll() {
    setLoading(true);
    try {
      const [ticketsRes, agentsRes, servicesRes, usersRes] = await Promise.all([
        fetch("/api/tickets").then(r => r.json()),
        fetch("/api/agents").then(r => r.json()),
        fetch("/api/services").then(r => r.json()),
        fetch("/api/users").then(r => r.json()),
      ]);

      // Expecting { tickets: [...] } or raw arrays; be tolerant
      setTickets(ticketsRes.tickets ?? ticketsRes ?? []);
      setAgents(agentsRes.agents ?? agentsRes ?? []);
      setServices(servicesRes.services ?? servicesRes ?? []);
      setUsers(usersRes.users ?? usersRes ?? []);
    } catch (err) {
      console.error("Failed loading admin data:", err);
      // handle errors
    }
    setLoading(false);
  }

  // ---------- Filters & Search ----------
  const filteredTickets = useMemo(() => {
    let list = [...tickets];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t =>
        String(t.id).includes(q) ||
        (t.serviceName || t.service?.name || "").toLowerCase().includes(q) ||
        (t.userName || t.user?.name || "").toLowerCase().includes(q) ||
        (t.userCnic || t.user?.cnic || "").includes(q) ||
        (t.customerPriority || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter(t => t.status === statusFilter);
    if (priorityFilter) list = list.filter(t => (t.customerPriority || t.finalPriority || "").toString() === priorityFilter);
    if (serviceFilter) list = list.filter(t => String(t.serviceId) === String(serviceFilter));
    if (agentFilter) list = list.filter(t => String(t.agentId) === String(agentFilter));

    return list;
  }, [tickets, query, statusFilter, priorityFilter, serviceFilter, agentFilter]);

  // ---------- Actions ----------
  async function assignAgent(ticketId, agentId) {
    setProcessingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (data.success) {
        // update UI
        setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, agentId, agentName: agents.find(a => a.id === parseInt(agentId))?.name ?? data.agentName ?? t.agentName } : t)));
      } else {
        alert(data.error || "Assign failed");
      }
    } catch (err) {
      console.error(err);
      alert("Assign request failed");
    }
    setProcessingId(null);
    setAssignModal({ open: false, ticketId: null });
  }

  async function changeStatus(ticketId, newStatus) {
    setProcessingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t)));
      } else {
        alert(data.error || "Status update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
    setProcessingId(null);
  }

  async function deleteTicket(ticketId) {
    if (!confirm("Delete ticket permanently?")) return;
    setProcessingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
    setProcessingId(null);
  }

  // Manage services/users/agents (create/update/delete)
  async function upsertService(service) {
    // service: { id?, name, fee, defaultPriority }
    try {
      const method = service.id ? "PUT" : "POST";
      const url = service.id ? `/api/services/${service.id}` : "/api/services";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      const data = await res.json();
      if (data.success) {
        await loadAll();
        setEditServiceModal({ open: false, service: null });
      } else {
        alert(data.error || "Service save failed");
      }
    } catch (err) {
      console.error(err);
      alert("Service save failed");
    }
  }

  async function deleteService(id) {
    if (!confirm("Delete service? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.filter(s => s.id !== id));
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  async function upsertUser(user) {
    try {
      const method = user.id ? "PUT" : "POST";
      const url = user.id ? `/api/users/${user.id}` : "/api/users";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (data.success) {
        await loadAll();
        setEditUserModal({ open: false, user: null });
      } else {
        alert(data.error || "User save failed");
      }
    } catch (err) {
      console.error(err);
      alert("User save failed");
    }
  }

  async function upsertAgent(agent) {
    try {
      const method = agent.id ? "PUT" : "POST";
      const url = agent.id ? `/api/agents/${agent.id}` : "/api/agents";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent),
      });
      const data = await res.json();
      if (data.success) {
        await loadAll();
        setEditAgentModal({ open: false, agent: null });
      } else {
        alert(data.error || "Agent save failed");
      }
    } catch (err) {
      console.error(err);
      alert("Agent save failed");
    }
  }

  async function deleteUser(userIdToDelete) {
    if (!confirm("Delete user?")) return;
    try {
      const res = await fetch(`/api/users/${userIdToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userIdToDelete));
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  async function deleteAgent(agentId) {
    if (!confirm("Delete agent?")) return;
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAgents(prev => prev.filter(a => a.id !== agentId));
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  // ---------- Export CSV ----------
  function downloadCSV(rows, filename = "report.csv") {
    if (!rows || !rows.length) {
      alert("No data to export");
      return;
    }
    const keys = Object.keys(rows[0]);
    const csv = [
      keys.join(","),
      ...rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportTickets() {
    const rows = filteredTickets.map(t => ({
      id: t.id,
      citizen: t.userName ?? t.user?.name ?? "",
      cnic: t.userCnic ?? t.user?.cnic ?? "",
      phone: t.userPhone ?? t.user?.phone ?? "",
      service: t.serviceName ?? t.service?.name ?? "",
      priority: t.customerPriority ?? t.finalPriority ?? "",
      status: t.status,
      agent: t.agentName ?? "",
      createdAt: t.createdAt,
    }));
    downloadCSV(rows, `tickets_report_${new Date().toISOString()}.csv`);
  }

  // ---------- Simple Chart Data (counts) ----------
  const chartData = useMemo(() => {
    const byService = services.map(s => ({
      service: s.name,
      count: tickets.filter(t => Number(t.serviceId) === Number(s.id)).length
    }));
    return { byService };
  }, [services, tickets]);

  // ---------- Role guard ----------
  if (!authorized) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold">Access denied</h2>
        <p className="text-gray-600 mt-2">You must be an admin to view this page.</p>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Manage tickets, users, services and agents</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadAll} className="px-4 py-2 bg-blue-600 text-white rounded">Refresh</button>
          <button onClick={exportTickets} className="px-4 py-2 bg-green-600 text-white rounded">Export CSV</button>
          <div className="text-sm text-gray-600">Admin: {storedUserId}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Tickets</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">High Priority</p>
          <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="border p-2 rounded flex-1"
            placeholder="Search by ticket id, citizen, CNIC, service..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <select className="border p-2 rounded" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>

          <select className="border p-2 rounded" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select className="border p-2 rounded" value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
            <option value="">All services</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select className="border p-2 rounded" value={agentFilter} onChange={e => setAgentFilter(e.target.value)}>
            <option value="">All agents</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select className="border p-2 rounded" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Tickets table */}
      <div className="bg-white p-4 rounded shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-2">Ticket</th>
                <th className="p-2">Citizen</th>
                <th className="p-2">Service</th>
                <th className="p-2">Priority</th>
                <th className="p-2">Status</th>
                <th className="p-2">Agent</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.slice(0, pageSize).map(t => (
                <tr key={t.id} className="border-t">
                  <td className="p-2 align-top">
                    <div className="font-semibold">#{t.id}</div>
                    <div className="text-xs text-gray-500">ID: {t.id}</div>
                  </td>

                  <td className="p-2 align-top">
                    <div className="font-medium">{t.userName ?? t.user?.name ?? "-"}</div>
                    <div className="text-xs text-gray-500">{t.userCnic ?? t.user?.cnic ?? ""}</div>
                    <div className="text-xs text-gray-500">{t.userPhone ?? t.user?.phone ?? ""}</div>
                  </td>

                  <td className="p-2 align-top">{t.serviceName ?? t.service?.name}</td>

                  <td className="p-2 align-top">{t.customerPriority ?? t.finalPriority ?? "-"}</td>

                  <td className="p-2 align-top">
                    <select
                      value={t.status}
                      onChange={(e) => changeStatus(t.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                      disabled={processingId === t.id}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </td>

                  <td className="p-2 align-top">
                    <div className="text-sm">{t.agentName ?? agents.find(a => a.id === t.agentId)?.name ?? "-"}</div>
                    <button
                      onClick={() => setAssignModal({ open: true, ticketId: t.id })}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Assign
                    </button>
                  </td>

                  <td className="p-2 align-top text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>

                  <td className="p-2 align-top">
                    <div className="flex flex-col gap-2">
                      <button className="px-3 py-1 bg-yellow-500 text-white rounded text-xs" onClick={() => { setEditUserModal({ open: true, user: t.user ?? null }); }}>
                        View User
                      </button>
                      <button className="px-3 py-1 bg-red-500 text-white rounded text-xs" onClick={() => deleteTicket(t.id)} disabled={processingId === t.id}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">No tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Assign modal ---------- */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Assign Agent to Ticket #{assignModal.ticketId}</h3>

            <select className="w-full border p-2 rounded mb-4" id="agentSelect">
              <option value="">-- Choose agent --</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currentLoad ?? 0} tickets)</option>)}
            </select>

            <div className="flex justify-end gap-2">
              <button className="px-3 py-1" onClick={() => setAssignModal({ open: false, ticketId: null })}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => {
                  const sel = document.getElementById("agentSelect");
                  const val = sel?.value;
                  if (!val) return alert("Select agent");
                  assignAgent(assignModal.ticketId, parseInt(val, 10));
                }}
              >
                {processingId === assignModal.ticketId ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Edit Service Modal (basic form) ---------- */}
      {editServiceModal.open && (
        <EditServiceModal
          service={editServiceModal.service}
          onClose={() => setEditServiceModal({ open: false, service: null })}
          onSave={upsertService}
        />
      )}

      {/* ---------- Edit User Modal ---------- */}
      {editUserModal.open && (
        <EditUserModal
          user={editUserModal.user}
          onClose={() => setEditUserModal({ open: false, user: null })}
          onSave={upsertUser}
          onDelete={deleteUser}
        />
      )}

      {/* ---------- Edit Agent Modal ---------- */}
      {editAgentModal.open && (
        <EditAgentModal
          agent={editAgentModal.agent}
          onClose={() => setEditAgentModal({ open: false, agent: null })}
          onSave={upsertAgent}
          onDelete={deleteAgent}
        />
      )}
    </div>
  );
}

/* ---------- Small helper modal components ---------- */

function EditServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState(service ?? { name: "", fee: 0, defaultPriority: "NORMAL" });

  useEffect(() => setForm(service ?? { name: "", fee: 0, defaultPriority: "NORMAL" }), [service]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">{form.id ? "Edit Service" : "Add Service"}</h3>

        <label className="block text-sm mb-1">Name</label>
        <input className="w-full border p-2 rounded mb-3" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />

        <label className="block text-sm mb-1">Fee</label>
        <input type="number" className="w-full border p-2 rounded mb-3" value={form.fee} onChange={e => setForm({...form, fee: Number(e.target.value)})} />

        <label className="block text-sm mb-1">Default Priority</label>
        <select className="w-full border p-2 rounded mb-4" value={form.defaultPriority} onChange={e => setForm({...form, defaultPriority: e.target.value})}>
          <option value="LOW">LOW</option>
          <option value="NORMAL">NORMAL</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(user ?? { name: "", phone: "", cnic: "", email: "", role: "CITIZEN" });

  useEffect(() => setForm(user ?? { name: "", phone: "", cnic: "", email: "", role: "CITIZEN" }), [user]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">{form.id ? "Edit User" : "Add User"}</h3>

        <label className="block text-sm mb-1">Name</label>
        <input className="w-full border p-2 rounded mb-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <label className="block text-sm mb-1">Phone</label>
        <input className="w-full border p-2 rounded mb-2" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <label className="block text-sm mb-1">CNIC</label>
        <input className="w-full border p-2 rounded mb-2" value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} />
        <label className="block text-sm mb-1">Email</label>
        <input className="w-full border p-2 rounded mb-3" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />

        <label className="block text-sm mb-1">Role</label>
        <select className="w-full border p-2 rounded mb-4" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
          <option value="CITIZEN">CITIZEN</option>
          <option value="AGENT">AGENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <div className="flex justify-between items-center gap-2">
          {form.id && <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(form.id)}>Delete</button>}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1">Cancel</button>
            <button onClick={() => onSave(form)} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditAgentModal({ agent, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(agent ?? { name: "", phone: "", maxTickets: 5 });

  useEffect(() => setForm(agent ?? { name: "", phone: "", maxTickets: 5 }), [agent]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">{form.id ? "Edit Agent" : "Add Agent"}</h3>

        <label className="block text-sm mb-1">Name</label>
        <input className="w-full border p-2 rounded mb-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <label className="block text-sm mb-1">Phone</label>
        <input className="w-full border p-2 rounded mb-2" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <label className="block text-sm mb-1">Max Tickets</label>
        <input type="number" className="w-full border p-2 rounded mb-3" value={form.maxTickets} onChange={e => setForm({...form, maxTickets: Number(e.target.value)})} />

        <div className="flex justify-between items-center gap-2">
          {form.id && <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(form.id)}>Delete</button>}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1">Cancel</button>
            <button onClick={() => onSave(form)} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
