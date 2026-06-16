import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/react";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

import { useClientDetail, useClientBookings } from "@/features/admin/hooks/useClientDetail";
import { UserAvatar } from "@/components/ui/UserAvatar";
import StatusBadge from "@/components/ui/StatusBadge";
import DashboardTable, {
  formatTableDate,
  TableCellText,
} from "@/components/dashboard/DashboardTable";

const BOOKING_COLUMNS = [
  { id: "id", name: "Booking ID" },
  { id: "date", name: "Date & Time" },
  { id: "provider", name: "Provider" },
  { id: "service", name: "Service" },
  { id: "status", name: "Status", align: "center" },
  { id: "price", name: "Price", align: "right" },
];

export default function AdminClientDetailPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [bookingPage, setBookingPage] = useState(1);

  // Queries
  const { data: client, isLoading: isClientLoading } = useClientDetail(clientId);
  const { data: bookingsRes, isLoading: isBookingsLoading } = useClientBookings(clientId, {
    page: bookingPage,
    limit: 8,
  });

  const renderBookingCell = (item, columnId) => {
    switch (columnId) {
      case "id":
        return <TableCellText className="text-xs font-mono">{item.id.slice(0, 8)}</TableCellText>;
      case "date":
        return (
          <div className="flex flex-col">
            <TableCellText strong>{formatTableDate(item.scheduled_time)}</TableCellText>
          </div>
        );
      case "provider":
        return <TableCellText>{item.business?.business_name || "—"}</TableCellText>;
      case "service":
        return <TableCellText muted>{item.items?.[0]?.business_service?.service?.name || "—"}</TableCellText>;
      case "status":
        return <StatusBadge status={item.status?.context || "PENDING"} />;
      case "price":
        return (
          <TableCellText strong className="tabular-nums">
            ${item.total_price || item.items?.[0]?.price_at_booking || 0}
          </TableCellText>
        );
      default:
        return item[columnId];
    }
  };

  if (isClientLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-gray-500">
        <NoSymbolIcon className="h-12 w-12" />
        <p className="text-lg font-medium">Client not found</p>
        <button
          onClick={() => navigate("/admin/clients")}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/clients")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-[13px] text-gray-500">ID: {client.id}</p>
          </div>
        </div>
      </div>

      {/* ── Top Profile Card ──────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between p-6 gap-6">
          <div className="flex items-start gap-5">
            <UserAvatar
              user={{ fullName: client.full_name }}
              className="h-20 w-20 shrink-0 text-2xl font-bold ring-4 ring-gray-50"
              bg="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600"
            />
            <div className="flex flex-col mt-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{client.full_name}</h2>
                <StatusBadge status={client.is_active ? "Active" : "Inactive"} />
              </div>
              
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6 text-[13px] text-gray-600">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  {client.email}
                  {client.email_verified && <CheckCircleIcon className="h-4 w-4 text-emerald-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  {client.phone || "No phone provided"}
                  {client.phone && client.phone_verified && <CheckCircleIcon className="h-4 w-4 text-emerald-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                  Joined {formatTableDate(client.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Stat Blocks */}
          <div className="flex flex-row md:flex-col gap-4">
            <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 px-5 py-3 text-center md:text-right min-w-[120px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Total Bookings</span>
              <span className="text-2xl font-bold text-gray-900">{client.total_bookings || 0}</span>
            </div>
            <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 px-5 py-3 text-center md:text-right min-w-[120px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Total Spent</span>
              <span className="text-2xl font-bold text-gray-900">${client.total_spent || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bookings Section ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Booking History</h3>
        <DashboardTable
          columns={BOOKING_COLUMNS}
          data={bookingsRes?.data ?? []}
          isLoading={isBookingsLoading}
          page={bookingPage}
          rowsPerPage={8}
          totalItems={bookingsRes?.meta?.total}
          totalPages={bookingsRes?.meta?.total_pages}
          onPageChange={setBookingPage}
          renderCell={renderBookingCell}
          emptyTitle="No bookings yet"
          emptyDescription="This customer hasn't made any bookings."
          ariaLabel="Customer bookings"
          minWidth="min-w-[48rem]"
          serverSide
        />
      </div>
    </div>
  );
}
