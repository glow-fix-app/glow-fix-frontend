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
import { useProviders } from "@/features/admin/hooks/useProviders";
import { getApiErrorMessage } from "@/services/apiResponse";

import { ShieldCheckIcon, StarIcon } from "@heroicons/react/24/solid";
import { ShieldCheckIcon as ShieldOutlineIcon, BriefcaseIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";

import StatCard from "@/components/dashboard/StatCard";
import { useDashboardStats } from "@/features/admin/hooks/useAdminDashboard";

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
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isError, error } = useProviders({ page, limit: ROWS_PER_PAGE });
  const { data: stats } = useDashboardStats();

  const providers = response?.data || [];
  const meta = response?.meta;

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "business":
        return (
          <div className="flex min-w-[12rem] items-center gap-3">
            <UserAvatar
              user={{ fullName: item.business_name }}
              className="h-9 w-9 shrink-0 text-xs font-medium"
              bg="bg-brand-50 text-brand-500 border border-brand-100"
            />
            <div className="flex flex-col">
              <TableCellText strong className="text-[14px]">
                {item.business_name}
              </TableCellText>
              <TableCellText muted className="text-[12px] leading-tight">
                {item.manager_name}
              </TableCellText>
            </div>
          </div>
        );
      case "city":
        return <TableCellText muted>{item.city || "—"}</TableCellText>;
      case "verified":
        return (
          <div className="flex justify-center">
            {item.current_status === "APPROVED" ? (
              <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
            ) : (
              <ShieldOutlineIcon className="h-5 w-5 text-gray-300" />
            )}
          </div>
        );
      case "rating":
        return (
          <div className="flex items-center justify-center gap-1">
            {item.average_rating > 0 ? (
              <>
                <StarIcon className="h-4 w-4 text-orange-400" />
                <TableCellText strong>{item.average_rating.toFixed(1)}</TableCellText>
              </>
            ) : (
              <TableCellText muted>—</TableCellText>
            )}
          </div>
        );
      case "bookings":
        return (
          <TableCellText muted className="tabular-nums">
            {item.total_bookings > 0 ? item.total_bookings : "—"}
          </TableCellText>
        );
      case "registered":
        return (
          <TableCellText muted>{formatTableDate(item.created_at)}</TableCellText>
        );
      case "status":
        return <StatusBadge status={item.current_status} />;
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for ${item.business_name}`}
            items={[
              { key: "view", label: "View Details" },
              { key: "edit", label: "Edit Provider" },
              {
                key: "deactivate",
                label: item.current_status === "APPROVED" ? "Suspend" : "Activate",
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Providers"
          value={stats?.total_businesses ?? "—"}
          icon={<BriefcaseIcon className="w-5 h-5 text-gray-500" />}
          subtext="vs last month: +12%"
        />
        <StatCard
          title="Approved"
          value={stats?.approved_businesses ?? "—"}
          icon={<CheckCircleIcon className="w-5 h-5 text-blue-500" />}
          subtext="vs last month: +5%"
        />
        <StatCard
          title="Pending Review"
          value={stats?.pending_businesses ?? "—"}
          icon={<ClockIcon className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Rejected"
          value={stats?.rejected_businesses ?? "—"}
          icon={<XCircleIcon className="w-5 h-5 text-rose-500" />}
        />
      </div>

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
        onRowAction={(id) => navigate(`/admin/providers/${id}`)}
      />
    </div>
  );
}
