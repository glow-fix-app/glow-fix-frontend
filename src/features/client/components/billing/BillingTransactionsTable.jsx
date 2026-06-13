import { useState } from "react";
import { Link } from "react-router-dom";
import { Spinner, Pagination } from "@heroui/react";
import StatusBadge from "@/components/ui/StatusBadge";
import { usePayments } from "@/features/client/hooks/usePayments";
import { ROUTE_PATHS } from "@/routes/paths";
import { formatDateShort, formatCurrency } from "@/features/client/utils/formatters";

const COLUMNS = ["Date", "Provider", "Service", "Amount", "Status", "Receipt"];

export default function BillingTransactionsTable() {
  const [page, setPage] = useState(1);
  const limit = 10; // Fixed items per page

  const { data: paymentsResult, isLoading, error } = usePayments({ page, limit });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Spinner size="lg" color="current" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-gray-200 bg-white text-[13px] text-red-500">
        Failed to load transactions.
      </div>
    );
  }

  const payments = paymentsResult?.data || [];
  const totalCount = paymentsResult?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Map API data to table format
  const transactions = payments.map((p) => ({
    id: p.id,
    dateLabel: p.paid_at ? formatDateShort(p.paid_at) : "Pending",
    provider: p.booking?.business?.businessName || "Service Provider",
    service: "Booking Payment",
    amount: p.amount,
    status: p.status, // PAID, PENDING, CANCELLED
  }));

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {transactions.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-[14px] text-text-tertiary">
          No transactions found.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-surface-hover">
                  {COLUMNS.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-5 py-3.5 text-[10px] font-normal uppercase tracking-[0.14em] text-text-muted"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-surface-hover/80"
                  >
                    <td className="px-5 py-4 text-[13px] text-text-tertiary">{transaction.dateLabel}</td>
                    <td className="px-5 py-4 text-[14px] font-medium text-text-primary">
                      {transaction.provider}
                    </td>
                    <td className="max-w-[220px] px-5 py-4 text-[13px] text-text-tertiary">
                      {transaction.service}
                    </td>
                    <td
                      className={`px-5 py-4 text-[14px] font-medium ${transaction.status === "CANCELLED" ? "text-text-muted" : "text-text-primary"
                        }`}
                    >
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-5 py-4">
                      {transaction.status === "PAID" ? (
                        <Link
                          to={ROUTE_PATHS.PAYMENT_RECEIPT(transaction.id)}
                          className="text-[13px] font-normal text-text-primary underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-[13px] text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-gray-100 md:hidden">
            {transactions.map((transaction) => (
              <article key={transaction.id} className="space-y-3 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-text-primary">{transaction.provider}</p>
                    <p className="mt-0.5 text-[12px] text-text-tertiary">{transaction.dateLabel}</p>
                  </div>
                  <StatusBadge status={transaction.status} />
                </div>
                <p className="text-[13px] text-text-tertiary">{transaction.service}</p>
                <div className="flex items-center justify-between">
                  <p
                    className={`text-[14px] font-medium ${transaction.status === "CANCELLED" ? "text-text-muted" : "text-text-primary"
                      }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </p>
                  {transaction.status === "PAID" ? (
                    <Link
                      to={ROUTE_PATHS.PAYMENT_RECEIPT(transaction.id)}
                      className="text-[13px] font-normal text-text-primary underline decoration-gray-300 underline-offset-4"
                    >
                      View receipt
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {/* ── Pagination controls ──────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row text-[12px]">
            <div className="text-[12px] text-text-tertiary">
              Showing <span className="font-semibold text-text-primary">{totalCount === 0 ? 0 : (page - 1) * limit + 1}</span> to{" "}
              <span className="font-semibold text-text-primary">{Math.min(page * limit, totalCount)}</span> of{" "}
              <span className="font-semibold text-text-primary">{totalCount}</span> transactions
            </div>

            {totalPages > 1 && (
              <div className="w-full max-w-2xs overflow-x-auto sm:max-w-full text-xs">
                <Pagination className="justify-center text-xs" size="sm">
                  <Pagination.Content className="text-xs">
                    <Pagination.Item className="text-xs">
                      <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)} className="text-xs">
                        <Pagination.PreviousIcon className="h-3 w-3" />
                        <span className="text-xs">Previous</span>
                      </Pagination.Previous>
                    </Pagination.Item>
                    {getPageNumbers().map((p, i) =>
                      p === "ellipsis" ? (
                        <Pagination.Item key={`ellipsis-${i}`} className="text-xs">
                          <Pagination.Ellipsis className="text-xs" />
                        </Pagination.Item>
                      ) : (
                        <Pagination.Item key={p} className="text-xs">
                          <Pagination.Link isActive={p === page} onPress={() => setPage(p)} className="text-xs font-medium">
                            {p}
                          </Pagination.Link>
                        </Pagination.Item>
                      ),
                    )}
                    <Pagination.Item className="text-xs">
                      <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)} className="text-xs">
                        <span className="text-xs">Next</span>
                        <Pagination.NextIcon className="h-3 w-3" />
                      </Pagination.Next>
                    </Pagination.Item>
                  </Pagination.Content>
                </Pagination>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
