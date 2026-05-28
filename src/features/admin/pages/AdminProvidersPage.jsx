import React, { useMemo, useState } from "react";
import { EmptyState } from "@heroui/react";

import DashboardTable, {
  formatTableDate,
  TableActionsMenu,
  TableCellText,
} from "@/components/dashboard/DashboardTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useProviders } from "@/features/admin/hooks/useProviders";
import { getApiErrorMessage } from "@/services/apiResponse";

import { ShieldCheckIcon, StarIcon } from "@heroicons/react/24/solid";
import { ShieldCheckIcon as ShieldOutlineIcon } from "@heroicons/react/24/outline";

const COLUMNS = [
  { id: "business", name: "Business Name", isRowHeader: true },
  { id: "city", name: "City" },
  { id: "verified", name: "Verified", align: "center" },
  { id: "rating", name: "Rating", align: "center" },
  { id: "bookings", name: "Bookings", align: "center" },
  { id: "registered", name: "Registered" },
  { id: "status", name: "Status" },
  { id: "actions", name: "", align: "right" },
];

const ROWS_PER_PAGE = 8;

export default function AdminProvidersPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isError, error } = useProviders({ page, limit: ROWS_PER_PAGE });

  const providers = response?.data || [];
  const meta = response?.meta;

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "business":
        return (
          <div className="flex min-w-[12rem] items-center gap-3">
            <UserAvatar
              user={{ fullName: item.businessName }}
              className="h-9 w-9 shrink-0 text-xs font-medium"
              bg="bg-brand-50 text-brand-500 border border-brand-100"
            />
            <div className="flex flex-col">
              <TableCellText strong className="text-[14px]">
                {item.businessName}
              </TableCellText>
              <TableCellText muted className="text-[12px] leading-tight">
                {item.name}
              </TableCellText>
            </div>
          </div>
        );
      case "city":
        return <TableCellText muted>{item.city || "—"}</TableCellText>;
      case "verified":
        return (
          <div className="flex justify-center">
            {item.verified ? (
              <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
            ) : (
              <ShieldOutlineIcon className="h-5 w-5 text-gray-300" />
            )}
          </div>
        );
      case "rating":
        return (
          <div className="flex items-center justify-center gap-1">
            {item.rating ? (
              <>
                <StarIcon className="h-4 w-4 text-gray-700" />
                <TableCellText strong>{item.rating}</TableCellText>
              </>
            ) : (
              <TableCellText muted>—</TableCellText>
            )}
          </div>
        );
      case "bookings":
        return (
          <TableCellText muted className="tabular-nums">
            {item.bookings > 0 ? item.bookings : "—"}
          </TableCellText>
        );
      case "registered":
        return (
          <TableCellText muted>{formatTableDate(item.registrationDate)}</TableCellText>
        );
      case "status":
        return <StatusBadge status={item.status} />;
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for ${item.businessName}`}
            items={[
              { key: "view", label: "View Details" },
              { key: "edit", label: "Edit Provider" },
              {
                key: "deactivate",
                label: item.status === "Active" ? "Suspend" : "Activate",
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
    () => providers.map((provider) => ({ ...provider, id: provider.id })),
    [providers],
  );

  if (isError) {
    return (
      <EmptyState className="rounded-md border border-border-default py-14 text-center">
        <p className="text-sm font-medium text-text-primary">
          Could not load providers
        </p>
        <p className="mt-1 text-[13px] text-text-tertiary">
          {getApiErrorMessage(error, "Failed to fetch providers.")}
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
      emptyTitle="No providers found"
      emptyDescription="Service providers will appear here."
      ariaLabel="Providers table"
      minWidth="min-w-[56rem]"
      serverSide
    />
  );
}
