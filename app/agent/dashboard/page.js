"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User, Ticket, LogOut, FileText, Clock, CheckCircle2, Settings, AlertCircle, Zap } from "lucide-react";

export default function AgentDashboard() {
  const [userId, setUserId ] = useState(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [tickets, setTickets] = useState([]);
  const [agent, setAgent] = useState({});
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Load agent ID from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("role");
    
    if (!storedId) {
      alert("Agent not logged in.");
      setTicketsLoading(false);
      return;
    }
    setUserId(storedId);
    setUserName(storedName);
    setUserRole(storedRole);

  }, []);

  //fetch agent info
    useEffect(() => {
    const fetchAgentInfo = async () => {
      const agentId = localStorage.getItem("userId");
      if (!agentId) return;

      try {
        const res = await fetch("/api/agent/me", {
          headers: { agentId }, // pass agentId in headers
        });
        const data = await res.json();
        if (data.agent) setAgent(data.agent);
      } catch (err) {
        console.error("Failed to fetch agent info:", err);
      }
    };

    fetchAgentInfo();
  }, []);

  // Fetch assigned tickets
  useEffect(() => {
  if (!userId) return;

  setTicketsLoading(true);

  fetch(`/api/agent/${userId}/tickets`)
    .then(res => res.json())
    .then(data => setTickets(data.tickets || []))
    .catch(console.error)
    .finally(() => setTicketsLoading(false));
}, [userId]);

// Auto-refresh tickets every 5 seconds WITHOUT UI flicker
useEffect(() => {
  if (!userId) return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/api/agent/${userId}/tickets`);
      const data = await res.json();

      setTickets(prev => {
        // If tickets changed, update them; otherwise keep same state
        if (JSON.stringify(prev) !== JSON.stringify(data.tickets)) {
          return data.tickets;
        }
        return prev;
      });

    } catch (err) {
      console.error("Auto-refresh error:", err);
    }
  }, 5000); // refresh every 5 sec

  return () => clearInterval(interval);
}, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    // setAgentId(null);
    setTickets([]);
    window.location.href = "/login";
  };

  const handleTicketUpdate = async (ticketId, newStatus) => {
    try {
      const res = await fetch(`/api/tickets/update/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) return alert(data.error);

      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket status.");
    }
  };

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === "COMPLETED").length;
  const pendingTickets = tickets.filter(t => t.status === "OPEN").length;
  const inProgressTickets = tickets.filter(t => t.status === "IN_PROGRESS").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700 border-green-300";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700 border-blue-300";
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="h-4 w-4" />;
      case "IN_PROGRESS": return <Settings className="h-4 w-4" />;
      case "PENDING": return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-80 bg-white shadow-2xl border-r flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b bg-green-600">
        <h2 className="text-xl text-center text-white">Agent Dashboard</h2>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <Card className="border-2 border-green-100 mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl shadow-lg">
                {agent.name?.charAt(0).toUpperCase() || <User className="h-8 w-8" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Agent ID</p>
              <p className="font-mono">{agent.id}</p>

              <p className="text-sm text-muted-foreground">Name</p>
              <p>{agent.name}</p>

              <p className="text-sm text-muted-foreground">Email</p>
              <p>{agent.email}</p>

              <p className="text-sm text-muted-foreground">Username</p>
              <p>{agent.username}</p>

              <p className="text-sm text-muted-foreground">Max Tickets</p>
              <p>{agent.maxTickets}</p>

              <p className="text-sm text-muted-foreground">Joined</p>
              <p>{new Date(agent.createdAt).toLocaleDateString()}</p>
            </div>

            <Separator />
            <Button onClick={handleLogout} variant="destructive" className="w-full mt-4">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  

      {/* ------------------ MAIN CONTENT ------------------ */}
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-slate-500">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Total Tickets</CardTitle>
              <FileText className="h-5 w-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{totalTickets}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">In Progress</CardTitle>
              <Settings className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-blue-600">{inProgressTickets}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-600">{completedTickets}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-yellow-600">{pendingTickets}</div>
            </CardContent>
          </Card>
        </div>

        {/* TICKET LIST */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" /> Assigned Tickets
            </CardTitle>
            <CardDescription>Manage tickets assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="text-center py-12">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <p className="text-center py-12">No tickets assigned yet.</p>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {tickets.map(t => (
                    <Card key={t.id} className="border-l-4 hover:shadow-md transition-all duration-300"
                      style={{
                        borderLeftColor:
                          t.status === "COMPLETED" ? "#16A34A" :
                          t.status === "IN_PROGRESS" ? "#2563EB" : "#EAB308"
                      }}
                    >
                      <CardHeader className="pb-3 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">Ticket #{t.id}</CardTitle>
                          </div>
                          <div className={`px-4 py-1 rounded-full text-sm flex items-center gap-1 mt-2 ${getStatusColor(t.status)}`}>
                            {getStatusIcon(t.status)} {t.status.replace("_", " ")}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {t.status !== "COMPLETED" && (
                            <Button size="sm" onClick={() => handleTicketUpdate(t.id, "COMPLETED")}>Mark Completed</Button>
                          )}
                          {t.status === "PENDING" && (
                            <Button size="sm" onClick={() => handleTicketUpdate(t.id, "IN_PROGRESS")}>Start Progress</Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <p>Service: {t.service.name}</p>
                        <p>Fee: Rs{t.service.fee?.toFixed(2) || 0}</p>
                        <p>Created: {new Date(t.createdAt).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

