import React, { useState } from "react";
import { useProviderPayouts } from "../hooks/useProviderPayouts";
import DashboardTable, {
  TableCellText,
  formatTableDate,
} from "@/components/dashboard/DashboardTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { Spinner, Card } from "@heroui/react";
import { BanknotesIcon, ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const COLUMNS = [
  { id: "id", name: "Payout ID", isRowHeader: true },
  { id: "amount", name: "Amount" },
  { id: "status", name: "Status" },
  { id: "bookings", name: "Included Bookings" },
  { id: "processed_at", name: "Processed At" },
  { id: "created_at", name: "Created At" },
];

export default function ProviderPayoutsPage() {
  const [page, setPage] = useState(1);
  const { payouts, meta, isLoading, error } = useProviderPayouts(page, 10);

  // Compute summary stats
  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const processedAmount = payouts.filter(p => p.status === 'PAYOUT_PROCESSED').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payouts.filter(p => p.status === 'PAYOUT_PENDING').reduce((sum, p) => sum + p.amount, 0);

  if (isLoading && payouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-500 font-medium">Loading your payouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Error Loading Payouts</h2>
        <p>There was a problem loading your payout history. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">View your earnings and settlement history.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-100 bg-white shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-900">EGP {totalAmount.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-100 bg-white shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Processed</p>
              <h3 className="text-2xl font-bold text-gray-900">EGP {processedAmount.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-100 bg-white shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ArrowPathIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900">EGP {pendingAmount.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DashboardTable
          columns={COLUMNS}
          data={payouts}
          isLoading={isLoading}
          page={meta?.page || 1}
          totalPages={meta?.total_pages || 1}
          onPageChange={setPage}
          renderCell={(item, columnId) => {
            switch (columnId) {
              case "id":
                return <TableCellText strong>PO-{item.id.slice(0, 8).toUpperCase()}</TableCellText>;
              case "amount":
                return <TableCellText strong className="text-gray-900">EGP {item.amount.toLocaleString()}</TableCellText>;
              case "status":
                return (
                  <div className="flex items-center">
                    <StatusBadge status={item.status} />
                  </div>
                );
              case "bookings":
                return (
                  <div className="flex flex-col">
                    <TableCellText>{item.bookings?.length || 0} bookings</TableCellText>
                    <span className="text-[11px] text-gray-500">
                      {item.bookings?.map(b => b.booking_code).slice(0, 2).join(', ')}
                      {item.bookings?.length > 2 ? ', ...' : ''}
                    </span>
                  </div>
                );
              case "processed_at":
                return <TableCellText>{item.processed_at ? formatTableDate(item.processed_at) : "—"}</TableCellText>;
              case "created_at":
                return <TableCellText>{formatTableDate(item.created_at)}</TableCellText>;
              default:
                const val = item[columnId];
                return typeof val === 'object' ? JSON.stringify(val) : val;
            }
          }}
      </div>
    </div>
  );
}
