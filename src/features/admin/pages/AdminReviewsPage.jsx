import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@heroui/react";
import { StarIcon, ChatBubbleLeftEllipsisIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import DashboardTable, {
  formatTableDate,
  TableActionsMenu,
  TableCellText,
} from "@/components/dashboard/DashboardTable";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { adminApi } from "@/features/admin/services/adminApi";
import { getApiErrorMessage } from "@/services/apiResponse";
import StatCard from "@/components/dashboard/StatCard";

const COLUMNS = [
  { id: "business", name: "Business", isRowHeader: true },
  { id: "customer", name: "Customer" },
  { id: "rating", name: "Rating", align: "center" },
  { id: "comment", name: "Review", hideBelow: "md" },
  { id: "date", name: "Date", hideBelow: "sm" },
  { id: "actions", name: "", align: "right" },
];

const ROWS_PER_PAGE = 8;

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [search] = useState("");

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['admin_reviews', page, ROWS_PER_PAGE, search],
    queryFn: () => adminApi.reviews({ page, limit: ROWS_PER_PAGE, search }),
    keepPreviousData: true,
  });

  const reviews = response?.data || [];
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
            </div>
          </div>
        );
      case "customer":
        return <TableCellText strong>{item.client_name}</TableCellText>;
      case "rating":
        return (
          <div className="flex justify-center items-center gap-1">
            <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-900">{item.rating}</span>
          </div>
        );
      case "comment":
        return (
          <div className="max-w-[200px] lg:max-w-[300px] truncate text-sm text-gray-600">
            {item.comment || <span className="text-gray-400 italic">No comment</span>}
          </div>
        );
      case "date":
        return (
          <TableCellText muted>{formatTableDate(item.created_at)}</TableCellText>
        );
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for review`}
            items={[
              { key: "view", label: "View Details" },
              {
                key: "delete",
                label: "Delete Review",
                variant: "danger",
              },
            ]}
          />
        );
      default:
        return item[columnId];
    }
  };

  if (isError) {
    return (
      <EmptyState className="rounded-md border border-border-default py-14 text-center">
        <p className="text-sm font-medium text-text-primary">
          Could not load reviews
        </p>
        <p className="mt-1 text-[13px] text-text-tertiary">
          {getApiErrorMessage(error, "Failed to fetch reviews.")}
        </p>
      </EmptyState>
    );
  }

  // Calculate simple stats based on the current page for now, or just placeholders if we don't have global stats
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all customer reviews left for businesses.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        <StatCard
          title="Total Reviews"
          value={meta?.total ?? "—"}
          icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          title="Average Rating"
          value={averageRating}
          icon={<StarIcon className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Flagged Reviews"
          value="0"
          icon={<ExclamationTriangleIcon className="w-5 h-5 text-red-500" />}
        />
      </div>

      {/* Table */}
      <DashboardTable
        columns={COLUMNS}
        data={reviews}
        isLoading={isLoading}
        page={page}
        rowsPerPage={ROWS_PER_PAGE}
        totalItems={meta?.total}
        totalPages={meta?.total_pages}
        onPageChange={setPage}
        renderCell={renderCell}
        emptyTitle="No reviews found"
        emptyDescription="Customer reviews will appear here once they start rating services."
        ariaLabel="Reviews table"
        minWidth="min-w-[56rem]"
        serverSide
      />
    </div>
  );
}
