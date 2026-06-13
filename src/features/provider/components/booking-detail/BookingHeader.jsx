import React from "react";
import { Button } from "@heroui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function BookingHeader({ id, status, navigate }) {
  const getStatusColor = (s) => {
    switch (s) {
      case "CONFIRMED":
      case "IN_PROGRESS":
      case "VEHICLE_RECEIVED":
      case "READY":
        return "bg-blue-500 animate-pulse";
      case "COMPLETED":
        return "bg-green-500";
      case "PENDING":
        return "bg-amber-500";
      case "CANCELLED":
      case "REJECTED":
        return "bg-rose-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
      <div className="flex items-center gap-3">
        <Button 
          isIconOnly 
          variant="light" 
          className="bg-white border border-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all rounded-full p-2" 
          onPress={() => navigate("/provider")}
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {id}
          </h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            Booking Detail
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold uppercase tracking-wider shadow-sm">
        <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
        <span className="text-gray-700">{status.replace('_', ' ')}</span>
      </div>
    </div>
  );
}
