import React from "react";
import { Card } from "@heroui/react";

export default function BookingSummaryCard({ id, items, scheduledAt, expectedDeliveryAt }) {
  const formattedId = id.slice(0, 8).toUpperCase();
  const serviceText = items.map(it => it.serviceTitle).join(", ") || "No services requested";
  
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Not scheduled";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid Date provided";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} at ${hh}:${min}`;
  };

  return (
    <Card className="p-6 border border-gray-100 bg-white rounded-2xl">
      <h3 className="text-gray-800 font-semibold text-sm mb-4 tracking-tight border-b border-gray-50 pb-2">Booking Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Reference</p>
          <p className="font-semibold text-gray-800 mt-1">BK-{formattedId}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Service</p>
          <p className="font-normal text-gray-600 mt-1">{serviceText}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Drop-off / Start</p>
          <p className="font-normal text-gray-600 mt-1">{formatDateTime(scheduledAt)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Expected Delivery</p>
          <p className="font-normal text-gray-600 mt-1">{expectedDeliveryAt ? formatDateTime(expectedDeliveryAt) : "Not set"}</p>
        </div>
      </div>
    </Card>
  );
}
