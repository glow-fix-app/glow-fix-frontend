import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Tabs, Label, SearchField } from "@heroui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import DashboardTable, {
  TableActionsMenu,
  TableCellText,
  formatTableDate,
} from "@/components/dashboard/DashboardTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { providerApi } from "@/features/provider/services/providerApi";

const COLUMNS = [
  { id: "reference", name: "Reference", isRowHeader: true },
  { id: "customer", name: "Customer" },
  { id: "service", name: "Service", hideBelow: "md" },
  { id: "dateTime", name: "Date & Time" },
  { id: "deliveryDate", name: "Delivery Date", allowsSorting: true },
  { id: "payment", name: "Payment" },
  { id: "status", name: "Status" },
  { id: "actions", name: "", align: "right" },
];

const ROWS_PER_PAGE = 10;

const TABS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function ProviderBookingsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({ column: "dateTime", direction: "descending" });
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when tab changes
  const handleTabChange = (key) => {
    setStatusFilter(key);
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["provider", "bookings", page, statusFilter, debouncedSearch, sortDescriptor],
    queryFn: () => {
      const params = {
        page,
        limit: ROWS_PER_PAGE,
      };
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (sortDescriptor.column === "deliveryDate") {
        params.sortBy = "deliveryDate";
        params.sortOrder = sortDescriptor.direction === "ascending" ? "asc" : "desc";
      }
      return providerApi.managerBookings(params);
    },
  });

  const bookings = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, lastPage: 1 };

  const handleAction = (key, bookingId) => {
    if (key === "view") {
      navigate(`/provider/bookings/${bookingId}`);
    }
  };

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "reference":
        return <TableCellText strong>{item.id}</TableCellText>;
      case "customer":
        return (
          <div className="flex min-w-[9rem] items-center gap-3">
            <UserAvatar
              user={{ fullName: item.client_name }}
              className="h-8 w-8 shrink-0 text-xs font-medium"
              bg="bg-surface-hover text-text-secondary border border-border-default"
            />
            <TableCellText strong>{item.client_name}</TableCellText>
          </div>
        );
      case "service":
        return <TableCellText>{item.items?.[0]?.serviceTitle || "Service"}</TableCellText>;
      case "dateTime":
        return (
          <div className="flex flex-col">
            <TableCellText muted>{formatTableDate(item.scheduled_at)}</TableCellText>
            <span className="text-[11px] text-text-muted">
              {new Date(item.scheduled_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </div>
        );
      case "deliveryDate":
        if (!item.expected_delivery_at) return <TableCellText muted>—</TableCellText>;
        return (
          <div className="flex flex-col">
            <TableCellText muted>{formatTableDate(item.expected_delivery_at)}</TableCellText>
            <span className="text-[11px] text-text-muted">
              {new Date(item.expected_delivery_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </div>
        );
      case "payment":
        return <StatusBadge status={item.payment ? item.payment.status : "PENDING"} />;
      case "status":
        return <StatusBadge status={item.status} />;
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for ${item.id}`}
            onAction={(key) => handleAction(key, item.id)}
            items={[
              { key: "view", label: "View Details" },
            ]}
          />
        );
      default:
        return item[columnId];
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-text-primary">Bookings</h1>
        <div className="w-full sm:w-auto">
          <SearchField name="search" value={searchQuery} onChange={setSearchQuery}>
            <Label className="sr-only">Search</Label>
            <SearchField.Group className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
              <SearchField.SearchIcon className="h-4 w-4 text-gray-400" />
              <SearchField.Input className="w-full sm:w-[280px] bg-transparent outline-none border-none text-[14px]" placeholder="Search by ID, name..." />
              <SearchField.ClearButton className="text-gray-400 hover:text-gray-600" />
            </SearchField.Group>
          </SearchField>
        </div>
      </div>

      <div className="mb-4 overflow-x-auto">
        <Tabs 
          variant="secondary"
          className="w-fit"
          selectedKey={statusFilter}
          onSelectionChange={handleTabChange}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Booking Status Tabs" className="flex justify-start gap-6 border-b border-divider whitespace-nowrap">
              {TABS.map((tab) => (
                <Tabs.Tab key={tab.key} id={tab.key} className="whitespace-nowrap">
                  {tab.label}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0 bg-white">
        <DashboardTable
          columns={COLUMNS}
          data={bookings}
          isLoading={isLoading}
          page={page}
          rowsPerPage={ROWS_PER_PAGE}
          totalItems={meta.total}
          totalPages={meta.lastPage}
          onPageChange={setPage}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          renderCell={renderCell}
          onRowAction={(key) => navigate(`/provider/bookings/${key}`)}
          emptyTitle="No bookings found"
          emptyDescription={
            searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your search or filters to find what you're looking for."
              : "When customers book your services, they'll show up here."
          }
          ariaLabel="Bookings table"
          minWidth="min-w-[64rem]"
          serverSide={true}
        />
      </div>
    </div>
  );
}
