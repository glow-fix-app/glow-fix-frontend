import React, { useState } from "react";

import DashboardTable, {
  TableActionsMenu,
  TableCellText,
} from "@/components/dashboard/DashboardTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";

const MOCK_BOOKINGS = [
  { id: 1, reference: "BK-1001", customerName: "Mohamed Ali", service: "Full Detail Wash", dateTime: "2026-04-07 • 09:00", source: "Online", payment: "Paid", status: "Confirmed" },
  { id: 2, reference: "BK-1002", customerName: "Sara Ibrahim", service: "Engine Diagnostics", dateTime: "2026-04-07 • 10:30", source: "Online", payment: "Pending", status: "In Progress" },
  { id: 3, reference: "BK-1003", customerName: "Khaled Mostafa", service: "Interior Cleaning", dateTime: "2026-04-07 • 11:00", source: "Online", payment: "Pending", status: "Pending" },
  { id: 4, reference: "BK-1004", customerName: "Nour El-Din", service: "Brake Replacement", dateTime: "2026-04-07 • 13:00", source: "Walk-In", payment: "Partial", status: "Confirmed" },
  { id: 5, reference: "BK-1005", customerName: "Fatma Zaki", service: "Exterior Wash", dateTime: "2026-04-06 • 14:00", source: "Online", payment: "Paid", status: "Completed" },
  { id: 6, reference: "BK-1006", customerName: "Omar Sayed", service: "AC Repair", dateTime: "2026-04-06 • 09:30", source: "Online", payment: "Paid", status: "Completed" },
  { id: 7, reference: "BK-1007", customerName: "Layla Mahmoud", service: "Ceramic Coating", dateTime: "2026-04-05 • 10:00", source: "Online", payment: "Paid", status: "Completed" },
  { id: 8, reference: "BK-1008", customerName: "Youssef Adel", service: "Tire Change", dateTime: "2026-04-08 • 08:00", source: "Online", payment: "Pending", status: "Pending" },
  { id: 9, reference: "BK-1009", customerName: "Hana Fathi", service: "Full Detail Wash", dateTime: "2026-04-08 • 11:00", source: "Online", payment: "Paid", status: "Confirmed" },
  { id: 10, reference: "BK-1010", customerName: "Ali Nasser", service: "Bodywork Repair", dateTime: "2026-04-04 • 09:00", source: "Online", payment: "Refunded", status: "Cancelled" },
];

const COLUMNS = [
  { id: "reference", name: "Reference", isRowHeader: true },
  { id: "customer", name: "Customer" },
  { id: "service", name: "Service" },
  { id: "dateTime", name: "Date & Time", hideBelow: "md" },
  { id: "source", name: "Source", hideBelow: "lg" },
  { id: "payment", name: "Payment" },
  { id: "status", name: "Status" },
  { id: "actions", name: "", align: "right" },
];

const ROWS_PER_PAGE = 8;

export default function ProviderBookingsPage() {
  const [page, setPage] = useState(1);

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "reference":
        return <TableCellText strong>{item.reference}</TableCellText>;
      case "customer":
        return (
          <div className="flex min-w-[9rem] items-center gap-3">
            <UserAvatar
              user={{ fullName: item.customerName }}
              className="h-8 w-8 shrink-0 text-xs font-medium"
              bg="bg-surface-hover text-text-secondary border border-border-default"
            />
            <TableCellText strong>{item.customerName}</TableCellText>
          </div>
        );
      case "service":
        return <TableCellText>{item.service}</TableCellText>;
      case "dateTime":
        return <TableCellText muted>{item.dateTime}</TableCellText>;
      case "source":
        return <TableCellText muted>{item.source}</TableCellText>;
      case "payment":
        return <StatusBadge status={item.payment} />;
      case "status":
        return <StatusBadge status={item.status} />;
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for ${item.reference}`}
            items={[
              { key: "view", label: "View Details" },
              { key: "edit", label: "Edit Booking" },
              { key: "cancel", label: "Cancel", variant: "danger" },
            ]}
          />
        );
      default:
        return item[columnId];
    }
  };

  return (
    <DashboardTable
      columns={COLUMNS}
      data={MOCK_BOOKINGS}
      page={page}
      rowsPerPage={ROWS_PER_PAGE}
      onPageChange={setPage}
      renderCell={renderCell}
      emptyTitle="No bookings found"
      ariaLabel="Bookings table"
      minWidth="min-w-[64rem]"
    />
  );
}
