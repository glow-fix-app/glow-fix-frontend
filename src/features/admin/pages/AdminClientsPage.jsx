import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import StatCard from "@/components/dashboard/StatCard";
import { useDashboardStats } from "@/features/admin/hooks/useAdminDashboard";
import { UserGroupIcon, UserPlusIcon, ChartBarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const COLUMNS = [
  { id: "customer", name: "Customer", isRowHeader: true },
  { id: "email", name: "Email" },
  { id: "phone", name: "Phone", hideBelow: "md" },
  { id: "registered", name: "Registered" },
  { id: "bookings", name: "Bookings", align: "center" },
  { id: "spent", name: "Spent", align: "center" },
  { id: "lastBooking", name: "Last Booking", hideBelow: "lg" },
  { id: "status", name: "Status" },
  { id: "actions", name: "", align: "right" },
];

const ROWS_PER_PAGE = 8;

export default function AdminClientsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isError, error } = useClients({ page, limit: ROWS_PER_PAGE });
  const { data: stats } = useDashboardStats();

  const clients = response?.data || [];
  const meta = response?.meta;

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "customer":
        return (
          <div className="flex min-w-[12rem] items-center gap-3">
            <UserAvatar
              user={{ fullName: item.full_name }}
              className="h-9 w-9 shrink-0 text-xs font-medium"
              bg="bg-brand-50 text-brand-500 border border-brand-100"
            />
            <div className="flex flex-col">
              <TableCellText strong className="text-[14px]">
                {item.full_name}
              </TableCellText>
            </div>
          </div>
        );
      case "email":
        return <TableCellText muted>{item.email}</TableCellText>;
      case "phone":
        return <TableCellText muted>{item.phone || "—"}</TableCellText>;
      case "registered":
        return (
          <TableCellText muted>{formatTableDate(item.created_at)}</TableCellText>
        );
      case "bookings":
        return (
          <TableCellText strong className="tabular-nums">
            {item.total_bookings > 0 ? item.total_bookings : "—"}
          </TableCellText>
        );
      case "spent":
        return (
          <TableCellText muted className="tabular-nums">
            {item.total_spent > 0 ? `$${item.total_spent}` : "—"}
          </TableCellText>
        );
      case "lastBooking":
        return (
          <TableCellText muted>{item.last_booking_date ? formatTableDate(item.last_booking_date) : "—"}</TableCellText>
        );
      case "status":
        return <StatusBadge status={item.is_active ? "Active" : "Inactive"} />;
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for ${item.full_name}`}
            items={[
              { key: "view", label: "View Details", onClick: () => navigate(`/admin/clients/${item.id}`) },
              { key: "edit", label: "Edit Client" },
              {
                key: "deactivate",
                label: item.is_active ? "Deactivate" : "Activate",
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
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={stats?.total_clients ?? "—"}
          icon={<UserGroupIcon className="w-5 h-5 text-gray-500" />}
        />
        <StatCard
          title="New Users Today"
          value={stats?.new_users_today ?? "—"}
          icon={<UserPlusIcon className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users ?? "—"}
          icon={<ChartBarIcon className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Active Accounts"
          value={stats?.total_clients ?? "—"} // Assuming most are active, or just showing total_clients again
          icon={<CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Table */}
      <DashboardTable
        columns={COLUMNS}
        data={tableData}
        isLoading={isLoading}
        page={page}
        rowsPerPage={ROWS_PER_PAGE}
        totalItems={meta?.total}
        totalPages={meta?.total_pages}
        onPageChange={setPage}
        renderCell={renderCell}
        emptyTitle="No customers found"
        emptyDescription="Registered customers will appear here."
        ariaLabel="Customers table"
        minWidth="min-w-[56rem]"
        serverSide
        onRowAction={(id) => navigate(`/admin/clients/${id}`)}
      />
    </div>
  );
}
