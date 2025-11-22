"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  Hash,
  ArrowLeft,
  FileText
} from "lucide-react";

export default function DeliveryTrackingPage({ params }) {
  const router = useRouter();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryId, setDeliveryId] = useState(null);

  useEffect(() => {
    params.then(p => setDeliveryId(p.id));
  }, [params]);

  useEffect(() => {
    if (!deliveryId) return;

    fetch(`/api/delivery/${deliveryId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDelivery(data.delivery);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [deliveryId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "DISPATCHED":
        return <Package className="h-6 w-6 text-blue-600" />;
      case "IN_TRANSIT":
        return <Truck className="h-6 w-6 text-purple-600" />;
      case "DELIVERED":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const isStepCompleted = (step) => {
    const statusOrder = ["PENDING", "DISPATCHED", "IN_TRANSIT", "DELIVERED"];
    const currentIndex = statusOrder.indexOf(delivery?.status);
    const stepIndex = statusOrder.indexOf(step);
    return currentIndex >= stepIndex;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading delivery information...</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Delivery Not Found</h2>
            <p className="text-gray-600 mb-6">No delivery information found for this ID.</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Card className="bg-linear-to-r from-emerald-600 to-green-600 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Truck className="h-8 w-8" />
                Delivery Tracking
              </CardTitle>
              <p className="text-green-100 mt-2">Track your document delivery in real-time</p>
            </CardHeader>
          </Card>
        </div>

        {/* Delivery Status */}
        <Card className="mb-6 shadow-xl">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(delivery.status)}
                <div>
                  <CardTitle className="text-xl">Current Status</CardTitle>
                  <p className="text-sm text-gray-600">Ticket #{delivery.ticket.id}</p>
                </div>
              </div>
              <Badge className={`px-4 py-2 text-sm font-semibold ${getStatusColor(delivery.status)}`}>
                {delivery.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Timeline */}
            <div className="space-y-6">
              {/* Step 1: Pending */}
              <div className="flex items-start gap-4">
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isStepCompleted("PENDING") ? "bg-green-500" : "bg-gray-300"}`}>
                  {isStepCompleted("PENDING") ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <Clock className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Order Placed</h4>
                  <p className="text-sm text-gray-600">Your delivery request has been received</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(delivery.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {isStepCompleted("PENDING") && <div className="ml-5 h-8 w-0.5 bg-gray-300"></div>}

              {/* Step 2: Dispatched */}
              <div className="flex items-start gap-4">
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isStepCompleted("DISPATCHED") ? "bg-blue-500" : "bg-gray-300"}`}>
                  {isStepCompleted("DISPATCHED") ? (
                    <Package className="h-5 w-5 text-white" />
                  ) : (
                    <Package className="h-5 w-5 text-white opacity-50" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Dispatched</h4>
                  <p className="text-sm text-gray-600">Order has been dispatched from NADRA office</p>
                  {delivery.agentName && (
                    <p className="text-xs text-gray-700 mt-1">
                      <strong>Agent:</strong> {delivery.agentName}
                    </p>
                  )}
                </div>
              </div>

              {isStepCompleted("DISPATCHED") && <div className="ml-5 h-8 w-0.5 bg-gray-300"></div>}

              {/* Step 3: In Transit */}
              <div className="flex items-start gap-4">
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isStepCompleted("IN_TRANSIT") ? "bg-purple-500" : "bg-gray-300"}`}>
                  {isStepCompleted("IN_TRANSIT") ? (
                    <Truck className="h-5 w-5 text-white" />
                  ) : (
                    <Truck className="h-5 w-5 text-white opacity-50" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Out for Delivery</h4>
                  <p className="text-sm text-gray-600">Package is on the way to your address</p>
                </div>
              </div>

              {isStepCompleted("IN_TRANSIT") && <div className="ml-5 h-8 w-0.5 bg-gray-300"></div>}

              {/* Step 4: Delivered */}
              <div className="flex items-start gap-4">
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isStepCompleted("DELIVERED") ? "bg-green-500" : "bg-gray-300"}`}>
                  {isStepCompleted("DELIVERED") ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-white opacity-50" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Delivered</h4>
                  <p className="text-sm text-gray-600">Package has been successfully delivered</p>
                  {delivery.actualDelivery && (
                    <p className="text-xs text-gray-700 mt-1">
                      <strong>Delivered at:</strong> {new Date(delivery.actualDelivery).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold">{delivery.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-semibold">{delivery.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Phone</p>
                <p className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  {delivery.phone}
                </p>
              </div>
              {delivery.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-semibold font-mono flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-600" />
                    {delivery.trackingNumber}
                  </p>
                </div>
              )}
              {delivery.estimatedDelivery && (
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    {new Date(delivery.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Delivery Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {delivery.agentName ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Agent Name</p>
                    <p className="font-semibold">{delivery.agentName}</p>
                  </div>
                  {delivery.agentPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Agent Contact</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        {delivery.agentPhone}
                      </p>
                    </div>
                  )}
                  {delivery.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Delivery Notes</p>
                      <p className="text-sm bg-gray-50 p-3 rounded border">{delivery.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Agent not assigned yet</p>
                  <p className="text-xs text-gray-400 mt-1">Will be updated once dispatched</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Details */}
        <Card className="mt-6 shadow-lg">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-semibold">{delivery.ticket.service?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ticket ID</p>
                <p className="font-semibold">#{delivery.ticket.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-semibold">{delivery.ticket.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-semibold">{new Date(delivery.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
