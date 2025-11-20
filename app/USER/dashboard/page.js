"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  RollerCoaster,
  Activity,
  TrendingUp,
  Upload,
  Truck,
  Download,
  File
} from 'lucide-react';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  
  // Document upload states
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Delivery states
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [needsDelivery, setNeedsDelivery] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      alert("Please login to access this page");
      router.push("/login");
      return;
    }
  }, [session, status, router]);


  // Fetch services
  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => setServices(data.services || []))
      .catch(console.error);
  }, []);

  // Fetch tickets
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    setTicketsLoading(true);
    fetch(`/api/tickets/user/${parseInt(session.user.id, 10)}`)
      .then(res => res.json())
      .then(data => {
        setTickets(data.tickets || []);
        console.log("Fetched tickets from API:", data);  
      })
      .catch(console.error)
      .finally(() => setTicketsLoading(false));
  }, [session, status]);

  async function handleTicketCreate() {
    if (!serviceId) return alert("Please select a service.");
    if (!session?.user?.id) return alert("User session not found.");

    // Validate delivery fields if delivery is needed
    if (needsDelivery) {
      if (!deliveryAddress || !deliveryCity || !deliveryPhone) {
        return alert("Please fill in all delivery details.");
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          customerPriority: priority,
          userId: parseInt(session.user.id, 10),
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        setLoading(false);
        return alert(data.error);
      }

      // If delivery is needed, add delivery details
      if (needsDelivery) {
        const deliveryRes = await fetch(`/api/tickets/${data.ticket.id}/delivery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: deliveryAddress,
            city: deliveryCity,
            phone: deliveryPhone,
          }),
        });

        const deliveryData = await deliveryRes.json();
        if (!deliveryData.success) {
          console.error("Delivery creation failed:", deliveryData.error);
        }
      }

      setLoading(false);
      alert(`🎉 Ticket Created! Ticket No: ${data.ticket.id}`);
      
      // Reset form
      setServiceId("");
      setPriority("NORMAL");
      setNeedsDelivery(false);
      setDeliveryAddress("");
      setDeliveryCity("");
      setDeliveryPhone("");
      setTickets(prev => [data.ticket, ...prev]);
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Something went wrong.");
    }
  }

  // Handle document upload
  async function handleDocumentUpload(ticketId, event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return alert("File size must be less than 5MB");
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/upload-document`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUploadingFile(false);

      if (!data.success) {
        return alert(data.error);
      }

      alert("✅ Document uploaded successfully!");
      
      // Refresh tickets to show uploaded document
      const ticketsRes = await fetch(`/api/tickets/user/${parseInt(session.user.id, 10)}`);
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData.tickets || []);
    } catch (err) {
      setUploadingFile(false);
      console.error(err);
      alert("Failed to upload document");
    }
  }

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === "COMPLETED").length;
  const pendingTickets = tickets.filter(t => t.status === "OPEN").length;
  const inProgressTickets = tickets.filter(t => t.status === "IN_PROGRESS").length;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (status === "loading" || ticketsLoading) return <p>Loading...</p>;
  if (!session) return <p>Please log in to view your dashboard.</p>;


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
    <div className="flex min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-green-50">
      
      {/* ---------------------- LEFT SIDEBAR ---------------------- */}
      <aside className="w-80 bg-white shadow-2xl border-r flex flex-col h-screen sticky top-0">
        {/* Logo Section */}
        <div className="p-6 border-b bg-linear-to-br from-emerald-600 via-green-600 to-teal-600">
          <div className="flex items-center justify-center mb-3">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl tracking-tight text-center text-white font-semibold">
            NADRA Citizen Portal
          </h2>
          <p className="text-xs text-center text-green-100 mt-1">National Database & Registration Authority</p>
        </div>

        {/* User Info Card */}
        <div className="p-6 flex-1 overflow-y-auto">
          <Card className="border-2 border-green-100 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-linear-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center text-white text-3xl shadow-xl border-4 border-white">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-semibold text-lg text-gray-800">{session?.user?.name || "N/A"}</p>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="text-sm text-gray-700">{session?.user?.email || "N/A"}</p>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Citizen ID</p>
                <p className="font-mono text-sm font-semibold text-gray-800">#{session?.user?.id || "N/A"}</p>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Account Type</p>
                  <Badge variant="outline" className="mt-1 capitalize border-green-200 text-green-700">
                    <User className="h-3 w-3 mr-1" />
                    {session?.user?.role?.toLowerCase() || "citizen"}
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
          <div className="mt-6 p-4 bg-linear-to-br from-emerald-50 via-green-50 to-teal-50 rounded-lg border border-green-200 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Need Assistance?</p>
                <p className="text-xs text-gray-600">
                  Contact NADRA support for help with your services and tickets.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-4 p-4 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-700 mb-3">Your Activity</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active:</span>
                <Badge variant="outline" className="text-blue-600 border-blue-200">{inProgressTickets}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed:</span>
                <Badge variant="outline" className="text-green-600 border-green-200">{completedTickets}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <Badge variant="outline" className="font-semibold">{totalTickets}</Badge>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------------- MAIN CONTENT ---------------------- */}
      <div className="flex-1 p-6 lg:p-8 overflow-auto">

        {/* ---------------------- HEADER ---------------------- */}
        <div className="mb-8">
          <Card className="bg-linear-to-r from-emerald-600 via-green-600 to-teal-600 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Citizen Dashboard</CardTitle>
              <CardDescription className="text-green-50">
                Manage your NADRA services and track requests efficiently
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* ---------------------- STAT CARDS ---------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">

          <Card className="border-l-4 border-l-slate-500 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 bg-linear-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Tickets</CardTitle>
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-700">{totalTickets}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                All service requests
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 bg-linear-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">In Progress</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{inProgressTickets}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Being processed now
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 bg-linear-to-br from-white to-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Completed</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedTickets}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Successfully resolved
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1  from-white to-amber-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Pending</CardTitle>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{pendingTickets}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Awaiting assignment
              </p>
            </CardContent>
          </Card>

        </div>

        {/* ---------------------- TICKET CREATION ---------------------- */}
        <Card className="mb-8 shadow-xl border-t-4 border-t-emerald-500 bg-linear-to-br from-white to-emerald-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Plus className="h-5 w-5 text-emerald-600" />
              </div>
              Create a New Service Request
            </CardTitle>
            <CardDescription className="text-base">
              Submit a new ticket for NADRA services - Fast & Easy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service" className="text-sm font-semibold">Select Service</Label>
                <select 
                  id="service"
                  className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
                  value={serviceId} 
                  onChange={e => setServiceId(e.target.value)}
                >
                  <option value="">-- Choose a Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Rs. {s.fee || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold">Priority Level</Label>
                <select 
                  id="priority"
                  className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="NORMAL">⚪ Normal Priority</option>
                  <option value="URGENT">🔴 Urgent Priority</option>
                </select>
              </div>

              {/* Delivery Option Checkbox */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="needsDelivery"
                    checked={needsDelivery}
                    onChange={(e) => setNeedsDelivery(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="needsDelivery" className="flex items-center gap-2 cursor-pointer">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">I need document delivery</span>
                  </Label>
                </div>

                {/* Delivery Form (shown when checkbox is checked) */}
                {needsDelivery && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="md:col-span-2">
                      <Label htmlFor="deliveryAddress" className="text-sm font-semibold">Delivery Address</Label>
                      <input
                        type="text"
                        id="deliveryAddress"
                        placeholder="Enter complete address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="flex h-11 w-full rounded-lg border-2 border-input bg-white px-4 py-2 text-sm mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryCity" className="text-sm font-semibold">City</Label>
                      <input
                        type="text"
                        id="deliveryCity"
                        placeholder="City name"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        className="flex h-11 w-full rounded-lg border-2 border-input bg-white px-4 py-2 text-sm mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryPhone" className="text-sm font-semibold">Contact Phone</Label>
                      <input
                        type="tel"
                        id="deliveryPhone"
                        placeholder="03XX-XXXXXXX"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="flex h-11 w-full rounded-lg border-2 border-input bg-white px-4 py-2 text-sm mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Button
                  onClick={handleTicketCreate}
                  disabled={loading}
                  className="w-full bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12 text-base shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  {loading ? "Creating Ticket..." : "Submit Service Request"}
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
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Service:</span>
                            <span>{t.serviceName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Price:</span>
                            <span>Rs. {t.fee?.toFixed(2) || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Created:</span>
                            <span>
                              {new Date(t.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        {t.delivery && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">Delivery Details</span>
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

                        {/* Documents Section */}
                        <div className="mt-3">
                          {t.documents && t.documents.length > 0 && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <File className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-900">
                                  Uploaded Documents ({t.documents.length})
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
                                      className="text-green-600 hover:text-green-800 ml-2"
                                    >
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Upload Document Button */}
                          <div className="mt-2">
                            <label
                              htmlFor={`file-upload-${t.id}`}
                              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer"
                            >
                              <Upload className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm text-gray-700">
                                {uploadingFile ? "Uploading..." : "Upload Document"}
                              </span>
                            </label>
                            <input
                              id={`file-upload-${t.id}`}
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => handleDocumentUpload(t.id, e)}
                              disabled={uploadingFile}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">
                              PDF, JPG, PNG, DOC (Max 5MB)
                            </p>
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