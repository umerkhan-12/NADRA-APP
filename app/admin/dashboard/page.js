"use client";

import { useState, useEffect, useRef } from "react";
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
  Gauge,
  Database,
  Cpu,
  Truck,
  File,
  Zap,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState(null);
  const [optimizations, setOptimizations] = useState(null);
  const [multithreadingResults, setMultithreadingResults] = useState(null);
  const [runningMultithreading, setRunningMultithreading] = useState(false);
  const isFetchingRef = useRef(false);

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

    const fetchAllData = async (force = false) => {
      if (isFetchingRef.current) return;
      if (!force && typeof document !== "undefined" && document.hidden) return;
      isFetchingRef.current = true;
      try {
        const [
          statsRes,
          ticketsRes,
          logsRes,
          agentsRes,
          visitorRes,
          optimizationsRes,
        ] = await Promise.all([
          fetchJSON("/api/admin/stats"),
          fetchJSON("/api/admin/tickets"),
          fetchJSON("/api/admin/logs"),
          fetchJSON("/api/admin/agents"),
          fetchJSON("/api/visitor"),
          fetchJSON("/api/admin/optimizations"),
        ]);

        if (JSON.stringify(tickets) !== JSON.stringify(ticketsRes?.tickets)) {
          setTickets(ticketsRes?.tickets || []);
        }
        setStats(statsRes?.stats || null);
        setLogs(logsRes?.logs || []);
        setAgents(agentsRes?.agents || []);
        setVisitorStats(visitorRes || null);
        setOptimizations(optimizationsRes || null);
      } catch (err) {
        console.error("Refresh failed:", err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    (async () => {
      await fetchAllData(true);
      setLoading(false);
    })();

    const interval = setInterval(() => fetchAllData(false), 60000);
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchAllData(true);
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }
    return () => {
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]); // FIXED ✔ ONLY session and status

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const runMultithreadingDemo = async (mode) => {
    setRunningMultithreading(true);
    try {
      const res = await fetch(`/api/admin/demo?mode=${mode}`);
      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid response from demo API (HTTP ${res.status})`);
        }
      }
      if (!res.ok) {
        throw new Error(data?.error || `Demo API error (HTTP ${res.status})`);
      }
      setMultithreadingResults({ ...data, mode });
    } catch (error) {
      console.error("Error:", error);
      alert("Error running demo: " + error.message);
    } finally {
      setRunningMultithreading(false);
    }
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

  if (status === "loading" || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
        <p className="text-slate-600 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-600">Redirecting to login...</p>
    </div>
  );

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
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              NADRA Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
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
          <Card className="bg-white border border-slate-200 text-slate-900 hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <TrendingUp className="inline h-3 w-3 mr-1 text-slate-400" />
                Registered citizens
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 text-slate-900 hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Total Tickets</CardTitle>
              <Ticket className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.totalTickets || 0}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <Activity className="inline h-3 w-3 mr-1 text-slate-400" />
                Service requests
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 text-slate-900 hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Total Agents</CardTitle>
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.totalAgents || 0}</div>
              <p className="text-xs text-slate-500 mt-1">
                Active support staff
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 text-slate-900 hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Pending Payments</CardTitle>
              <CreditCard className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stats?.pendingPayments || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visitor Statistics */}
        {visitorStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border border-slate-200 text-slate-900 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">Total Visitors</CardTitle>
                <Users className="h-5 w-5 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{visitorStats.totalVisitors || 0}</div>
                <p className="text-xs text-slate-500 mt-1">All time visits</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 text-slate-900 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">Unique Visitors</CardTitle>
                <UserCheck className="h-5 w-5 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{visitorStats.uniqueVisitors || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Unique IP addresses</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 text-slate-900 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">Today&apos;s Visitors</CardTitle>
                <Activity className="h-5 w-5 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{visitorStats.todayVisitors || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Visits today</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 text-slate-900 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">This Week</CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{visitorStats.weekVisitors || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Optimization Dashboard */}
        {optimizations && (
          <Card className="bg-white border shadow-sm transition-shadow">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Gauge className="h-5 w-5 text-indigo-600" />
                Performance Optimization
              </CardTitle>
              <CardDescription className="text-slate-500">
                Live status of optimization features and benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!optimizations.success && (
                <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {optimizations.error ||
                    "Optimization stats unavailable. Check /api/admin/optimizations."}
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Activity className="h-4 w-4 text-purple-600" />
                      Async Email Queue
                    </div>
                    <Badge
                      variant={
                        optimizations.queue?.available
                          ? "default"
                          : optimizations.queue?.enabled
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {optimizations.queue?.available
                        ? "Connected"
                        : optimizations.queue?.enabled
                          ? "Offline"
                          : "Disabled"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>Waiting: {optimizations.queue?.jobs?.waiting ?? "-"}</div>
                    <div>Active: {optimizations.queue?.jobs?.active ?? "-"}</div>
                    <div>Completed: {optimizations.queue?.jobs?.completed ?? "-"}</div>
                    <div>Failed: {optimizations.queue?.jobs?.failed ?? "-"}</div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {optimizations.queue?.message ||
                      optimizations.queue?.error ||
                      "Queue running normally."}
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Database className="h-4 w-4 text-blue-600" />
                      Index Analysis
                    </div>
                    <Badge variant={optimizations.indexes?.available ? "default" : "secondary"}>
                      {optimizations.indexes?.available ? "Ready" : "Not Run"}
                    </Badge>
                  </div>
                  {optimizations.indexes?.available ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                      <div>Tables: {optimizations.indexes?.totals?.tables ?? "-"}</div>
                      <div>Indexes: {optimizations.indexes?.totals?.indexes ?? "-"}</div>
                      <div>Unused: {optimizations.indexes?.totals?.unusedIndexes ?? "-"}</div>
                      <div>Missing: {optimizations.indexes?.totals?.missingIndexes ?? "-"}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-3">
                      {optimizations.indexes?.message}
                    </p>
                  )}
                  {optimizations.indexes?.generatedAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Last run: {new Date(optimizations.indexes.generatedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="rounded-lg border p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Query Benchmarking
                    </div>
                    <Badge variant={optimizations.benchmarks?.available ? "default" : "secondary"}>
                      {optimizations.benchmarks?.available ? "Ready" : "Not Run"}
                    </Badge>
                  </div>
                  {optimizations.benchmarks?.available ? (
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <div>
                        Avg latency: {optimizations.benchmarks?.summary?.averageAvg ?? "-"}ms
                      </div>
                      <div>
                        Fastest: {optimizations.benchmarks?.summary?.fastest?.label ?? "-"}
                      </div>
                      <div>
                        Slowest: {optimizations.benchmarks?.summary?.slowest?.label ?? "-"}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-3">
                      {optimizations.benchmarks?.message}
                    </p>
                  )}
                  {optimizations.benchmarks?.generatedAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Last run:{" "}
                      {new Date(optimizations.benchmarks.generatedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="rounded-lg border p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Cpu className="h-4 w-4 text-orange-600" />
                      Worker Threads
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    Pool size: {optimizations.workers?.poolSize ?? 4} workers
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {optimizations.workers?.note ||
                      "CPU-heavy tasks run in parallel without blocking."}
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      Multithreading Demo
                    </div>
                    <Badge variant="outline">Interactive</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => runMultithreadingDemo("sequential")}
                      disabled={runningMultithreading}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {runningMultithreading ? "Running..." : "Sequential"}
                    </Button>
                    <Button
                      onClick={() => runMultithreadingDemo("parallel")}
                      disabled={runningMultithreading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {runningMultithreading ? "Running..." : "Parallel (4x)"}
                    </Button>
                  </div>
                  {multithreadingResults && (
                    <div
                      className={`mt-3 rounded p-2 text-xs font-semibold ${
                        multithreadingResults.mode === "sequential"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {multithreadingResults.duration} •{" "}
                      {multithreadingResults.mode === "sequential"
                        ? "BLOCKING"
                        : "NON-BLOCKING"}
                      {multithreadingResults.info && (
                        <div className="mt-1 font-normal text-slate-700">
                          {multithreadingResults.info}
                        </div>
                      )}
                      {multithreadingResults.speedup && (
                        <div className="mt-1 text-yellow-700">
                          ⚡ {multithreadingResults.speedup}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Agent Form */}
        <Card className="bg-white border shadow-sm transition-shadow">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Plus className="h-5 w-5 text-indigo-600" />
              Create New Agent
            </CardTitle>
            <CardDescription className="text-slate-500">
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
              <div className="overflow-x-auto">
                <div className="rounded-md border min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Delivery</TableHead>
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
                        <TableCell>
                          {t.documents && t.documents.length > 0 ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <File className="h-3 w-3" />
                              {t.documents.length} file{t.documents.length > 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">No files</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {t.delivery ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <Truck className="h-3 w-3" />
                                {t.delivery.status}
                              </Badge>
                              <span className="text-xs text-gray-500">{t.delivery.city}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No delivery</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(t.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
