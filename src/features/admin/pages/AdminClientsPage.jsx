import React, { useMemo, useState } from "react";
import { EmptyState } from "@heroui/react";

import DashboardTable, {
  formatTableDate,
  TableActionsMenu,
  TableCellText,
} from "@/components/dashboard/DashboardTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useClients } from "@/features/admin/hooks/useClients";
import { getApiErrorMessage } from "@/services/apiResponse";

const COLUMNS = [
  { id: "customer", name: "Customer", isRowHeader: true },
  { id: "email", name: "Email" },
  { id: "phone", name: "Phone", hideBelow: "md" },
  { id: "registered", name: "Registered" },
  { id: "bookings", name: "Bookings", align: "center" },
  { id: "lastBooking", name: "Last Booking", hideBelow: "lg" },
  { id: "status", name: "Status" },
  { id: "actions", name: "", align: "right" },
];

const ROWS_PER_PAGE = 8;

export default function AdminClientsPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isError, error } = useClients({ page, limit: ROWS_PER_PAGE });

  const clients = response?.data || [];
  const meta = response?.meta;

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "customer":
        return (
          <div className="flex min-w-[10rem] items-center gap-3">
            <UserAvatar
              user={{ fullName: item.name }}
              className="h-9 w-9 shrink-0 text-xs font-medium"
              bg="bg-surface-hover text-text-secondary border border-border-default"
            />
            <TableCellText strong>{item.name}</TableCellText>
          </div>
        );
      case "email":
        return <TableCellText muted>{item.email}</TableCellText>;
      case "phone":
        return <TableCellText muted>{item.phone || "—"}</TableCellText>;
      case "registered":
        return (
          <TableCellText>{formatTableDate(item.registrationDate)}</TableCellText>
        );
      case "bookings":
        return (
          <TableCellText strong className="tabular-nums">
            {item.totalBookings ?? 0}
          </TableCellText>
        );
      case "lastBooking":
        return (
          <TableCellText>{formatTableDate(item.lastBookingDate)}</TableCellText>
        );
      case "status":
        return <StatusBadge status={item.status} />;
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for ${item.name}`}
            items={[
              { key: "view", label: "View Details" },
              { key: "edit", label: "Edit Client" },
              {
                key: "deactivate",
                label: item.status === "Active" ? "Deactivate" : "Activate",
                variant: "danger",
              },
            ]}
          />
        );
      default:
        return item[columnId];
    }
  };

  const tableData = useMemo(
    () => clients.map((client) => ({ ...client, id: client.id })),
    [clients],
  );

  if (isError) {
    return (
      <EmptyState className="rounded-md border border-border-default py-14 text-center">
        <p className="text-sm font-medium text-text-primary">
          Could not load clients
        </p>
        <p className="mt-1 text-[13px] text-text-tertiary">
          {getApiErrorMessage(error, "Failed to fetch clients.")}
        </p>
      </EmptyState>
    );
  }

  return (
    <DashboardTable
      columns={COLUMNS}
      data={tableData}
      isLoading={isLoading}
      page={page}
      rowsPerPage={ROWS_PER_PAGE}
      totalItems={meta?.total}
      totalPages={meta?.totalPages}
      onPageChange={setPage}
      renderCell={renderCell}
      emptyTitle="No clients found"
      emptyDescription="Registered customers will appear here."
      ariaLabel="Clients table"
      minWidth="min-w-[56rem]"
      serverSide
    />
  );
}
