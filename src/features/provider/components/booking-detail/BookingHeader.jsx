import React from "react";
import { Button, Select, ListBox } from "@heroui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import StatusBadge from "@/components/ui/StatusBadge";

export default function BookingHeader({ id, status, paymentStatus, navigate, onUpdateStatus }) {
  const isPaid = paymentStatus === "PAID";

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
      
      <Select 
        className="w-[170px]" 
        aria-label="Update status"
        selectedKeys={[status]}
        isDisabled={["COMPLETED", "CANCELLED", "REJECTED"].includes(status)}
        onSelectionChange={(keys) => {
          const key = typeof keys === "string" ? keys : (keys?.currentKey || Array.from(keys)[0]);
          if (key && onUpdateStatus) onUpdateStatus(key);
        }}
      >
        <Select.Trigger className="bg-white hover:bg-gray-50 p-1.5 min-h-0 h-auto rounded-xl flex items-center justify-between gap-2 border border-gray-200 w-full">
          <Select.Value>
            {(value) => <StatusBadge status={value?.textValue || status} />}
          </Select.Value>
          <svg className="w-4 h-4 text-gray-400 shrink-0 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="VEHICLE_RECEIVED" textValue="VEHICLE_RECEIVED" description={!isPaid ? "Payment required" : undefined} isDisabled={!isPaid}>Vehicle Received</ListBox.Item>
            <ListBox.Item id="IN_PROGRESS" textValue="IN_PROGRESS" description={!isPaid ? "Payment required" : undefined} isDisabled={!isPaid}>In Progress</ListBox.Item>
            <ListBox.Item id="READY" textValue="READY" description={!isPaid ? "Payment required" : undefined} isDisabled={!isPaid}>Ready</ListBox.Item>
            <ListBox.Item id="COMPLETED" textValue="COMPLETED" description={!isPaid ? "Payment required" : undefined} isDisabled={!isPaid}>Completed</ListBox.Item>
            {!["COMPLETED", "CANCELLED", "READY", "READY_FOR_PICKUP", "REJECTED"].includes(status) && status === "PENDING" && (
              <ListBox.Item id="REJECTED" textValue="REJECTED" className="text-danger" color="danger">Reject</ListBox.Item>
            )}
            {!["COMPLETED", "CANCELLED", "READY", "READY_FOR_PICKUP", "REJECTED", "PENDING"].includes(status) && (
              <ListBox.Item id="CANCELLED" textValue="CANCELLED" className="text-danger" color="danger">Cancelled</ListBox.Item>
            )}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
