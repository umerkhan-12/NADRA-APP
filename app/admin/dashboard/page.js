"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Ticket,
  UserCheck,
  CreditCard,
  LogOut,
  Plus,
  Activity,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Agent creation state
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentUsername, setAgentUsername] = useState("");
  const [agentPassword, setAgentPassword] = useState("");
  const [creatingAgent, setCreatingAgent] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      alert("Please login to access this page");
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      alert("Access denied. Admin only.");
      router.push("/login");
    }
  }, [session, status, router]);

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
    if (status !== "authenticated" || !session?.user) return;

    const fetchAllData = async () => {
      try {
        const [
          ticketsRes,
          usersRes,
          servicesRes,
          paymentsRes,
          logsRes,
          agentsRes,

        ] = await Promise.all([
          fetchJSON("/api/admin/tickets"),
          fetchJSON("/api/admin/users"),
          fetchJSON("/api/admin/services"),
          fetchJSON("/api/admin/payments"),
          fetchJSON("/api/admin/logs"),
          fetchJSON("/api/admin/agents"), // fetch agents
        ]);

        if (JSON.stringify(tickets) !== JSON.stringify(ticketsRes?.tickets)) {
          setTickets(ticketsRes?.tickets || []);
        }
        if (JSON.stringify(users) !== JSON.stringify(usersRes?.users)) {
          setUsers(usersRes?.users || []);
        }
        if (
          JSON.stringify(services) !== JSON.stringify(servicesRes?.services)
        ) {
          setServices(servicesRes?.services || []);
        }
        if (
          JSON.stringify(payments) !== JSON.stringify(paymentsRes?.payments)
        ) {
          setPayments(paymentsRes?.payments || []);
        }
        if (JSON.stringify(logs) !== JSON.stringify(logsRes?.logs)) {
          setLogs(logsRes?.logs || []);
        }
        if (JSON.stringify(agents) !== JSON.stringify(agentsRes?.agents)) {
          setAgents(agentsRes?.agents || []);
        }
      } catch (err) {
        console.error("Refresh failed:", err);
      }
    };

    (async () => {
      await fetchAllData();
      setLoading(false);
    })();

    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, [session, status]); // FIXED ✔ ONLY session and status

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Create Agent
  const handleCreateAgent = async () => {
    if (!agentName || !agentEmail || !agentPassword)
      return alert("All fields required");
    setCreatingAgent(true);

    try {
      const res = await fetch("/api/admin/agents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          email: agentEmail,
          username: agentUsername,
          password: agentPassword,
        }),
      });

      const data = await res.json();
      setCreatingAgent(false);

      if (!data.success) return alert(data.error);

      alert(`✅ Agent created: ${data.agent.name}`);
      
      setAgentName("");
      setAgentEmail("");
      setAgentUsername("");
      setAgentPassword("");
      setAgents((prev) => [data.agent, ...prev]); // update UI instantly
    } catch (err) {
      console.error(err);
      setCreatingAgent(false);
      alert("Something went wrong while creating agent");
    }
  };

  if (status === "loading" || loading) return <p>Loading dashboard...</p>;
  if (!session) return <p>Redirecting to login...</p>;

//   const handleDeleteAgent = async (agentId) => {
//   if (!agentId) return alert("Agent ID missing");
//   console.log("Deleting agent ID:", agentId);
//   if (!confirm("Are you sure you want to delete this agent?")) return;

//   try {
//     const res = await fetch(`/api/admin/agents/delete/${agentId}`, {
//       method: "DELETE",
//     });
//     const data = await res.json();

//     if (!data.success) return alert(data.error || "Failed to delete agent");

//     alert("✅ Agent deleted successfully!");
//     setAgents(prev => prev.filter(a => a.id !== agentId));
//   } catch (err) {
//     console.error(err);
//     alert("Something went wrong while deleting the agent.");
//   }
// };


  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "IN_PROGRESS":
        return "outline";
      case "RESOLVED":
        return "secondary";
      default:
        return "outline";
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
              NADRA Admin Dashboard
            </h1>
            <p className="text-purple-200 mt-1">
              Manage users, agents, and tickets
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Users</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
              <p className="text-xs text-blue-100 mt-1 flex items-center">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Registered citizens
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Tickets</CardTitle>
              <Ticket className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tickets.length}</div>
              <p className="text-xs text-purple-100 mt-1 flex items-center">
                <Activity className="inline h-3 w-3 mr-1" />
                Service requests
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Agents</CardTitle>
              <UserCheck className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{agents.length}</div>
              <p className="text-xs text-green-100 mt-1">
                Active support staff
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Pending Payments</CardTitle>
              <CreditCard className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {payments.filter((p) => p.status === "PENDING").length}
              </div>
              <p className="text-xs text-orange-100 mt-1">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Agent Form */}
        <Card className="bg-white/95 backdrop-blur border-purple-200 shadow-xl hover:shadow-2xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Plus className="h-5 w-5" />
              Create New Agent
            </CardTitle>
            <CardDescription className="text-purple-700">
              Add a new support agent to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Name</Label>
                <Input
                  id="agent-name"
                  type="text"
                  placeholder="Agent Name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-email">Email</Label>
                <Input
                  id="agent-email"
                  type="email"
                  placeholder="agent@nadra.gov.pk"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-username">Username</Label>
                <Input
                  id="agent-username"
                  type="text"
                  placeholder="Username"
                  value={agentUsername}
                  onChange={(e) => setAgentUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-password">Password</Label>
                <Input
                  id="agent-password"
                  type="password"
                  placeholder="••••••••"
                  value={agentPassword}
                  onChange={(e) => setAgentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="invisible">Action</Label>
                <Button
                  onClick={handleCreateAgent}
                  disabled={creatingAgent}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {creatingAgent ? "Creating..." : "Create Agent"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents List
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Agents
            </CardTitle>
            <CardDescription>Current support agents in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No agents available.</p>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {agents.map((agent, index) => (
                    <div key={agent.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      {index < agents.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card> */}
{/* Agents List */}
<Card className="shadow-md">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <UserCheck className="h-5 w-5" />
      Agents
    </CardTitle>
    <CardDescription>
      Current support agents in the system
    </CardDescription>
  </CardHeader>
  <CardContent>
    {agents.length === 0 ? (
      <p className="text-muted-foreground text-center py-8">
        No agents available.
      </p>
    ) : (
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {agents.map((agent, index) => (
            <div key={agent.id}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                {/* Agent Info */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.email}</p>
                  </div>
                </div>

                {/* Actions - Aligned to the right */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Active</Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to delete ${agent.name}?`)) return;
                      try {
                        const res = await fetch(`/api/admin/agents/delete/${agent.id}`, {
                          method: "DELETE",
                        });
                        const data = await res.json();
                        if (!data.success) return alert(data.error || "Failed to delete agent");

                        alert(`✅ Agent ${agent.name} deleted successfully!`);
                        setAgents(prev => prev.filter(a => a.id !== agent.id));
                      } catch (err) {
                        console.error(err);
                        alert("Something went wrong while deleting the agent.");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {index < agents.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    )}
  </CardContent>
</Card>



        {/* Tickets Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Tickets
            </CardTitle>
            <CardDescription>
              All service requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tickets available.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>#{t.id}</TableCell>
                        <TableCell>{t.userName || t.user?.name}</TableCell>
                        <TableCell>
                          {t.serviceName || t.service?.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(t.customerPriority)}>
                            {t.customerPriority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(t.status)}>
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(t.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity Logs
            </CardTitle>
            <CardDescription>
              System activity and ticket updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No logs available.
              </p>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {logs.map((l, index) => (
                    <div key={l.id}>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">
                              Ticket #{l.ticketId}:
                            </span>{" "}
                            {l.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(l.time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {index < logs.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
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
