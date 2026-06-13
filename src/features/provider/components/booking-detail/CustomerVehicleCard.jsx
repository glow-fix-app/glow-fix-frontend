import React from "react";
import { Card } from "@heroui/react";
import { TruckIcon } from "@heroicons/react/24/outline";

export default function CustomerVehicleCard({ client, vehicle }) {
  const user = client?.user;
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "U";

  // Handle vehicle details properly from schema fields: model, year, color, licensePlate
  const model = vehicle?.model || "Unknown Model";
  const color = vehicle?.color ? `${vehicle.color} ` : "";
  const vehicleName = `${color}${model}`;

  return (
    <Card className="p-6 border border-gray-100 bg-white rounded-2xl">
      <h3 className="text-gray-800 font-semibold text-sm mb-5 tracking-tight border-b border-gray-50 pb-2">Customer & Vehicle</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Customer Column */}
        <div className="space-y-4 pr-0 md:pr-6 md:border-r border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50/70 border border-blue-100/50 flex items-center justify-center font-semibold text-blue-600 text-sm shadow-sm">
              {initials}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Customer</p>
              <p className="font-semibold text-gray-800 mt-0.5">{user?.fullName || "Unknown Client"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Phone Number</p>
              <p className="font-normal text-gray-600 mt-0.5">{user?.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Email Address</p>
              <p className="font-normal text-gray-600 mt-0.5 break-all">{user?.email || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm flex-shrink-0">
              <TruckIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Vehicle Details</p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {vehicleName}
                {vehicle?.year && <span className="text-gray-400 font-normal ml-1">({vehicle.year})</span>}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">License Plate</p>
              <p className="font-semibold text-gray-700 mt-1">
                {vehicle?.licensePlate || "Not provided"}
              </p>
            </div>
            {vehicle?.vin && (
              <div>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">VIN Number</p>
                <p className="font-normal text-gray-600 mt-1 select-all">
                  {vehicle.vin}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
