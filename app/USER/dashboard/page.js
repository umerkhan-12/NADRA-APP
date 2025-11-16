"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Ticket, 
  LogOut, 
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings,
  CreditCard,
  Calendar,
  Zap,
  RollerCoaster
} from 'lucide-react';

export default function UserDashboard() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Load userId from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("userName");
    console.log("Stored user info:", { storedId, storedName });
    const storedRole = localStorage.getItem("role");
    if (!storedId) {
      alert("User not logged in. Please login again.");
      setTicketsLoading(false);
      return;
    }
    setUserId(storedId);
    setUserName(storedName);
    setUserRole(storedRole);
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

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setUserId(null);
    setTickets([]);
    window.location.href = "/login";
  };

  if (!userId && !ticketsLoading) return <p>Please log in to view your dashboard.</p>;


// Your existing getStatusColor function
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Settings className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority) => {
    return priority === 'URGENT' ? (
      <Badge variant="destructive" className="ml-2">
        <Zap className="h-3 w-3 mr-1" />
        URGENT
      </Badge>
    ) : (
      <Badge variant="secondary" className="ml-2">NORMAL</Badge>
    );
  };
return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-green-50 to-slate-100">
      
      {/* ---------------------- LEFT SIDEBAR ---------------------- */}
      <aside className="  w-80 bg-white shadow-2xl border-r flex flex-col h-screen sticky top-0">
        {/* Logo Section */}
        <div className="p-6 border-b bg-linear-to-br from-green-600 to-green-700">
          <img
            src="/logo.png"
            alt="NADRA Logo"
            className="w-32 mx-auto mb-3 bg-white rounded-lg p-2"
          />
          <h2 className="text-xl tracking-tight text-center text-white">
            NADRA Citizen Portal
          </h2>
        </div>

        {/* User Info Card */}
        <div className=" p-6 flex-1">
          <Card className="border-2 border-green-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl shadow-lg">
                  {userName ? userName.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono">{userId}</p>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    <User className="h-3 w-3 mr-1" />
                    {userRole.toLowerCase()}
                  </Badge>
              </div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full mt-4"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <div className="mt-6 p-4 bg-linear-to-br from-green-50 to-blue-50 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-2">Need Help?</p>
            <p className="text-sm">
              Contact NADRA support for assistance with your services and tickets.
            </p>
          </div>
        </div>
      </aside>

      {/* ---------------------- MAIN CONTENT ---------------------- */}
      <div className="flex-1 p-6 lg:p-8 overflow-auto">

        {/* ---------------------- HEADER ---------------------- */}
        <div className="mb-8">
          <Card className="bg-linear-to-r from-green-600 to-green-700 text-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl">Citizen Dashboard</CardTitle>
              <CardDescription className="text-green-100">
                Manage your services and tickets easily
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* ---------------------- STAT CARDS ---------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">

          <Card className="border-l-4 border-l-slate-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Tickets</CardTitle>
              <FileText className="h-5 w-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{totalTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All service requests
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">In Progress</CardTitle>
              <Settings className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-blue-600">{inProgressTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Being processed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-600">{completedTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully resolved
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-yellow-600">{pendingTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting action
              </p>
            </CardContent>
          </Card>

        </div>

        {/* ---------------------- TICKET CREATION ---------------------- */}
        <Card className="mb-8 shadow-md border-t-4 border-t-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create a New Ticket
            </CardTitle>
            <CardDescription>
              Submit a new service request to NADRA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service">Select Service</Label>
                <select 
                  id="service"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={serviceId} 
                  onChange={e => setServiceId(e.target.value)}
                >
                  <option value="">-- Choose a Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Rs{s.fee || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select 
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Button
                  onClick={handleTicketCreate}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  {loading ? "Creating Ticket..." : "Generate Ticket"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------------------- TICKET LIST (UPGRADED) ---------------------- */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              My Tickets
            </CardTitle>
            <CardDescription>
              View and track all your service requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                <p className="mt-2 text-muted-foreground">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tickets created yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first ticket to get started!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {tickets.map(t => (
                    <Card
                      key={t.id}
                      className="border-l-4 hover:shadow-md transition-all duration-300"
                      style={{
                        borderLeftColor:
                          t.status === "COMPLETED"
                            ? "#16A34A"
                            : t.status === "IN_PROGRESS"
                            ? "#2563EB"
                            : "#EAB308",
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">
                              Ticket #{t.id}
                            </CardTitle>
                            {getPriorityBadge(t.customerPriority)}
                          </div>
                          <div className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${getStatusColor(t.status)}`}>
                            {getStatusIcon(t.status)}
                            {t.status.replace("_", " ")}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Service:</span>
                            <span>{t.serviceName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Price:</span>
                            <span>Rs{t.fee?.toFixed(2) || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Created:</span>
                            <span>
                              {new Date(t.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
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