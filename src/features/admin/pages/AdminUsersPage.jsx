import React, { useMemo, useState } from "react";
import { EmptyState } from "@heroui/react";

import DashboardTable, {
  formatTableDate,
  TableActionsMenu,
  TableCellText,
} from "@/components/dashboard/DashboardTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useUsers } from "@/features/admin/hooks/useUsers";
import { getApiErrorMessage } from "@/services/apiResponse";

const COLUMNS = [
  { id: "user", name: "Admin User", isRowHeader: true },
  { id: "email", name: "Email" },
  { id: "phone", name: "Phone", hideBelow: "md" },
  { id: "registered", name: "Registered" },
  { id: "status", name: "Status" },
  { id: "actions", name: "", align: "right" },
];

const ROWS_PER_PAGE = 8;

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isError, error } = useUsers({ page, limit: ROWS_PER_PAGE });

  const users = response?.data || [];
  const meta = response?.meta;

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "user":
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
      case "status":
        return <StatusBadge status={item.status} />;
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for ${item.name}`}
            items={[
              { key: "view", label: "View Details" },
              { key: "edit", label: "Edit User" },
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
    () => users.map((user) => ({ ...user, id: user.id })),
    [users],
  );

  if (isError) {
    return (
      <EmptyState className="rounded-md border border-border-default py-14 text-center">
        <p className="text-sm font-medium text-text-primary">
          Could not load users
        </p>
        <p className="mt-1 text-[13px] text-text-tertiary">
          {getApiErrorMessage(error, "Failed to fetch users.")}
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
      emptyTitle="No admin users found"
      emptyDescription="Admin accounts will appear here."
      ariaLabel="Admin users table"
      minWidth="min-w-[56rem]"
      serverSide
    />
  );
}
