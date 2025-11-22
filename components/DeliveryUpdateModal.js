"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { X, Truck, CheckCircle, AlertCircle } from "lucide-react";

export default function DeliveryUpdateModal({ delivery, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    status: delivery?.status || "PENDING",
    agentName: delivery?.agentName || "",
    agentPhone: delivery?.agentPhone || "",
    trackingNumber: delivery?.trackingNumber || "",
    estimatedDelivery: delivery?.estimatedDelivery ? delivery.estimatedDelivery.split('T')[0] : "",
    notes: delivery?.notes || "",
  });

  const statusOptions = [
    { value: "PENDING", label: "📦 Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "DISPATCHED", label: "🚀 Dispatched", color: "bg-blue-100 text-blue-800" },
    { value: "IN_TRANSIT", label: "🚚 In Transit", color: "bg-purple-100 text-purple-800" },
    { value: "DELIVERED", label: "✅ Delivered", color: "bg-green-100 text-green-800" },
    { value: "CANCELLED", label: "❌ Cancelled", color: "bg-red-100 text-red-800" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, status: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`/api/delivery/${delivery.id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update delivery");
      }

      setSuccess("Delivery updated successfully! Email notification sent.");
      
      // Call parent update handler
      if (onUpdate) {
        onUpdate(data.delivery);
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-linear-to-r from-blue-500 to-purple-500 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6" />
              <CardTitle>Update Delivery Status</CardTitle>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-2">Delivery ID: #{delivery?.id}</p>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Current Delivery Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery Address</h3>
            <p className="text-sm text-gray-600">{delivery?.address}</p>
            <p className="text-sm text-gray-600">{delivery?.city}</p>
            <p className="text-sm text-gray-600">Phone: {delivery?.phone}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status Dropdown */}
            <div>
              <Label htmlFor="status" className="text-sm font-semibold">
                Delivery Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current: <span className={`px-2 py-0.5 rounded ${statusOptions.find(s => s.value === delivery?.status)?.color}`}>
                  {statusOptions.find(s => s.value === delivery?.status)?.label}
                </span>
              </p>
            </div>

            {/* Agent Name */}
            <div>
              <Label htmlFor="agentName" className="text-sm font-semibold">
                Delivery Agent Name
              </Label>
              <input
                type="text"
                id="agentName"
                name="agentName"
                value={formData.agentName}
                onChange={handleChange}
                placeholder="e.g., Ahmed Khan"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Agent Phone */}
            <div>
              <Label htmlFor="agentPhone" className="text-sm font-semibold">
                Delivery Agent Phone
              </Label>
              <input
                type="text"
                id="agentPhone"
                name="agentPhone"
                value={formData.agentPhone}
                onChange={handleChange}
                placeholder="e.g., 0300-1234567"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tracking Number */}
            <div>
              <Label htmlFor="trackingNumber" className="text-sm font-semibold">
                Tracking Number
              </Label>
              <input
                type="text"
                id="trackingNumber"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                placeholder="e.g., TRK123456789"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Estimated Delivery Date */}
            <div>
              <Label htmlFor="estimatedDelivery" className="text-sm font-semibold">
                Estimated Delivery Date
              </Label>
              <input
                type="date"
                id="estimatedDelivery"
                name="estimatedDelivery"
                value={formData.estimatedDelivery}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-semibold">
                Delivery Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions or notes..."
                rows={3}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Delivery
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Updating the delivery status will automatically send an email notification to the customer with the latest tracking information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
