"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Download, Printer, ArrowLeft } from "lucide-react";

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef();

  useEffect(() => {
    fetchReceipt();
  }, [params.ticketId]);

  const fetchReceipt = async () => {
    try {
      const res = await fetch(`/api/payments/receipt/${params.ticketId}`);
      const data = await res.json();
      if (data.success) {
        setReceipt(data.receipt);
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `NADRA_Receipt_${params.ticketId}`,
  });

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Receipt not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Printer size={20} />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={20} />
              Download
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="bg-white p-8 rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b-2 border-emerald-600 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-emerald-800">NADRA</h1>
                <p className="text-sm text-gray-600 mt-1">
                  National Database & Registration Authority
                </p>
                <p className="text-sm text-gray-600">Pakistan</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">RECEIPT</p>
                <p className="text-sm text-gray-600 mt-1">
                  Receipt #{receipt.id}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(receipt.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
              Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{receipt.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CNIC</p>
                <p className="font-medium text-gray-900">
                  {receipt.user.cnic || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{receipt.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">
                  {receipt.user.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
              Service Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Service Type</p>
                <p className="font-medium text-gray-900">
                  {receipt.ticket.service.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ticket ID</p>
                <p className="font-medium text-gray-900">#{receipt.ticketId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-medium text-gray-900">
                  {receipt.ticket.servicePriority}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-gray-900">
                  {receipt.ticket.status}
                </p>
              </div>
              {receipt.ticket.agent && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Handled By</p>
                  <p className="font-medium text-gray-900">
                    {receipt.ticket.agent.name} ({receipt.ticket.agent.email})
                  </p>
                </div>
              )}
              {receipt.ticket.service.description && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900">
                    {receipt.ticket.service.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
              Payment Information
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Service Fee</span>
                <span className="text-gray-900 font-medium">
                  Rs. {receipt.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  Rs. {receipt.amount.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      receipt.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {receipt.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Payment Date</span>
                  <span className="text-sm text-gray-900">
                    {new Date(receipt.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                This is a computer-generated receipt and does not require a
                signature.
              </p>
              <p className="mb-2">
                For queries, contact NADRA Helpline: 111-222-333
              </p>
              <p className="font-medium text-emerald-700">
                Thank you for using NADRA Online Services
              </p>
            </div>
          </div>

          {/* Watermark */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Receipt ID: {receipt.id} | Generated on{" "}
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
