import React, { useState } from "react";
import { EmptyState } from "@heroui/react";

import DashboardTable, {
  formatTableDate,
  TableCellText,
} from "@/components/dashboard/DashboardTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAdminBookings } from "@/features/admin/hooks/useAdminBookings";
import { getApiErrorMessage } from "@/services/apiResponse";

const COLUMNS = [
  { id: "id", name: "Booking ID" },
  { id: "customer", name: "Customer" },
  { id: "provider", name: "Provider" },
  { id: "service", name: "Service", hideBelow: "md" },
  { id: "date", name: "Date & Time" },
  { id: "status", name: "Status", align: "center" },
  { id: "price", name: "Price", align: "right" },
];

const ROWS_PER_PAGE = 10;

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);

  const { data: response, isLoading, isError, error } = useAdminBookings({
    page,
    limit: ROWS_PER_PAGE,
  });

  const bookings = response?.data || [];
  const meta = response?.meta;

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "id":
        return <TableCellText className="text-xs font-mono">{item.id.slice(0, 8)}</TableCellText>;
      case "customer":
        return <TableCellText strong>{item.client_name || item.vehicle?.client?.user?.fullName || "—"}</TableCellText>;
      case "provider":
        return <TableCellText>{item.business?.businessName || "—"}</TableCellText>;
      case "service":
        return <TableCellText muted>{item.items?.[0]?.serviceTitle || "—"}</TableCellText>;
      case "date":
        return <TableCellText strong>{formatTableDate(item.scheduled_at)}</TableCellText>;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">All Bookings</h1>
        <p className="text-sm text-gray-500">Monitor all booking activity across the platform.</p>
      </div>

      {isError ? (
        <EmptyState className="rounded-md border border-border-default py-14 text-center">
          <p className="text-sm font-medium text-text-primary">Could not load bookings</p>
          <p className="mt-1 text-[13px] text-text-tertiary">
            {getApiErrorMessage(error, "Failed to fetch bookings.")}
          </p>
        </EmptyState>
      ) : (
        <DashboardTable
          columns={COLUMNS}
          data={bookings}
          isLoading={isLoading}
          page={page}
          rowsPerPage={ROWS_PER_PAGE}
          totalItems={meta?.total}
          totalPages={meta?.total_pages}
          onPageChange={setPage}
          renderCell={renderCell}
          emptyTitle="No bookings found"
          emptyDescription="There are no bookings on the platform yet."
          ariaLabel="All bookings table"
          minWidth="min-w-[64rem]"
          serverSide
        />
      )}
    </div>
  );
}
