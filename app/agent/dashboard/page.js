"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User, Ticket, LogOut, FileText, Clock, CheckCircle2, Settings, AlertCircle, Zap, Download, File, Truck } from "lucide-react";

export default function AgentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [agent, setAgent] = useState({});
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      alert("Please login to access this page");
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "AGENT") {
      alert("Access denied. Agent only.");
      router.push("/login");
    }
  }, [session, status, router]);

  //fetch agent info
  useEffect(() => {
    const fetchAgentInfo = async () => {
      if (status !== "authenticated" || !session?.user?.id) return;

      try {
        const res = await fetch("/api/agent/me", {
          headers: { agentId: session.user.id },
        });
        const data = await res.json();
        if (data.agent) setAgent(data.agent);
      } catch (err) {
        console.error("Failed to fetch agent info:", err);
      }
    };

    fetchAgentInfo();
  }, [session, status]);

  // Fetch assigned tickets
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    setTicketsLoading(true);

    fetch(`/api/agent/${session.user.id}/tickets`)
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
      .catch(console.error)
      .finally(() => setTicketsLoading(false));
  }, [session, status]);

  // Auto-refresh tickets every 5 seconds WITHOUT UI flicker
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/${session.user.id}/tickets`);
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
  }, [session, status]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
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

  if (status === "loading" || ticketsLoading) return <p>Loading dashboard...</p>;
  if (!session) return <p>Redirecting to login...</p>;

  return (
    <div className="flex min-h-screen bg-linear-to-br from-cyan-900 via-blue-900 to-slate-900">
      <aside className="w-80 bg-white/95 backdrop-blur shadow-2xl border-r border-cyan-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b bg-linear-to-br from-cyan-600 to-blue-700">
        <h2 className="text-xl text-center text-white font-semibold tracking-tight">Agent Dashboard</h2>
        <p className="text-xs text-center text-cyan-100 mt-1">Support Portal</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <Card className="border-2 border-cyan-200 mb-4 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">
                {session?.user?.name?.charAt(0).toUpperCase() || <User className="h-8 w-8" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-semibold text-lg">{session?.user?.name || agent.name || "N/A"}</p>
            </div>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Agent ID</p>
              <p className="font-mono text-sm">#{session?.user?.id || agent.id || "N/A"}</p>
            </div>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm">{session?.user?.email || agent.email || "N/A"}</p>
            </div>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="text-sm font-medium">{agent.username || "N/A"}</p>
            </div>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Max Tickets Capacity</p>
              <Badge variant="outline" className="mt-1">
                <Zap className="h-3 w-3 mr-1" />
                {agent.maxTickets || 5} Tickets
              </Badge>
            </div>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-xs">{agent.createdAt ? new Date(agent.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }) : "N/A"}</p>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="w-full mt-4">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-4 p-4 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 shadow-md">
          <p className="text-xs text-cyan-700 mb-2 font-semibold">Performance Overview</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="font-semibold text-cyan-600">{inProgressTickets}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span className="font-semibold text-green-600">{completedTickets}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Handled:</span>
              <span className="font-semibold">{totalTickets}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  

      {/* ------------------ MAIN CONTENT ------------------ */}
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <Card className="bg-linear-to-br from-cyan-600 to-blue-700 text-white border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Agent Portal</CardTitle>
              <CardDescription className="text-cyan-100">
                Manage and resolve citizen service requests
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-linear-to-br from-slate-500 to-slate-600 border-none text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Tickets</CardTitle>
              <FileText className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTickets}</div>
              <p className="text-xs text-slate-100 mt-1">All assigned</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-blue-500 to-blue-600 border-none text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">In Progress</CardTitle>
              <Settings className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inProgressTickets}</div>
              <p className="text-xs text-blue-100 mt-1">Currently working</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 border-none text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedTickets}</div>
              <p className="text-xs text-green-100 mt-1">Successfully resolved</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-yellow-500 to-yellow-600 border-none text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Pending</CardTitle>
              <Clock className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTickets}</div>
              <p className="text-xs text-yellow-100 mt-1">Awaiting action</p>
            </CardContent>
          </Card>
        </div>

        {/* TICKET LIST */}
        <Card className="bg-white/95 backdrop-blur shadow-2xl border-cyan-200">
          <CardHeader className="bg-linear-to-br from-cyan-50 to-blue-50 border-b border-cyan-100">
            <CardTitle className="flex items-center gap-2 text-cyan-900">
              <Ticket className="h-5 w-5" /> Assigned Tickets
            </CardTitle>
            <CardDescription className="text-cyan-700">Manage tickets assigned to you</CardDescription>
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
                      <CardContent className="space-y-3">
                        <div className="text-sm space-y-1">
                          <p><strong>Service:</strong> {t.service.name}</p>
                          <p><strong>Fee:</strong> Rs. {t.service.fee?.toFixed(2) || 0}</p>
                          <p><strong>User:</strong> {t.user?.name || "N/A"}</p>
                          <p><strong>Created:</strong> {new Date(t.createdAt).toLocaleString()}</p>
                        </div>

                        {/* Delivery Information */}
                        {t.delivery && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">Delivery Required</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {t.delivery.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p><strong>Address:</strong> {t.delivery.address}</p>
                              <p><strong>City:</strong> {t.delivery.city}</p>
                              <p><strong>Phone:</strong> {t.delivery.phone}</p>
                            </div>
                          </div>
                        )}

                        {/* Documents */}
                        {t.documents && t.documents.length > 0 && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <File className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-900">
                                Attached Documents ({t.documents.length})
                              </span>
                            </div>
                            <div className="space-y-2">
                              {t.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                                  <span className="truncate flex-1">{doc.filePath.split('/').pop()}</span>
                                  <a
                                    href={doc.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-800 ml-2 flex items-center gap-1"
                                  >
                                    <Download className="h-4 w-4" />
                                    View
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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

