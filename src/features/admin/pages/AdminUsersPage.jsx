import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { EmptyState, Spinner, toast } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

import DashboardTable, {
  formatTableDate,
  TableActionsMenu,
  TableCellText,
} from "@/components/dashboard/DashboardTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useUsers } from "@/features/admin/hooks/useUsers";
import { getApiErrorMessage } from "@/services/apiResponse";
import { adminApi } from "@/features/admin/services/adminApi";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Query only admins
  const { data: response, isLoading, isError, error } = useUsers({ 
    page, 
    limit: ROWS_PER_PAGE, 
    role: "ADMIN" 
  });

  const createMut = useMutation({
    mutationFn: (data) => adminApi.createUser({ ...data, role: "ADMIN" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setIsAddModalOpen(false);
      setFormData({ full_name: "", email: "", phone: "", password: "" });
      toast.success("Admin user created successfully");
    },
    onError: (err) => {
      toast.danger(getApiErrorMessage(err, "Failed to create admin"));
    }
  });

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    createMut.mutate(formData);
  };

  const users = response?.data || [];
  const meta = response?.meta;

  const renderCell = (item, columnId) => {
    switch (columnId) {
      case "user":
        return (
          <div className="flex min-w-[10rem] items-center gap-3">
            <UserAvatar
              user={{ fullName: item.full_name }}
              className="h-9 w-9 shrink-0 text-xs font-medium"
              bg="bg-brand-50 text-brand-500 border border-brand-100"
            />
            <TableCellText strong>{item.full_name}</TableCellText>
          </div>
        );
      case "email":
        return <TableCellText muted>{item.email}</TableCellText>;
      case "phone":
        return <TableCellText muted>{item.phone || "—"}</TableCellText>;
      case "registered":
        return (
          <TableCellText>{formatTableDate(item.created_at)}</TableCellText>
        );
      case "status":
        return <StatusBadge status={item.is_active ? "Active" : "Inactive"} />;
      case "actions":
        return (
          <TableActionsMenu
            ariaLabel={`Actions for ${item.full_name}`}
            items={[
              { key: "view", label: "View Details", onClick: () => navigate(`/admin/users/${item.id}`) },
              { key: "edit", label: "Edit User" },
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
    () => users.map((user) => ({ ...user, id: user.id })),
    [users],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">Manage platform administrators and their permissions.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Admin
        </button>
      </div>

      {isError ? (
        <EmptyState className="rounded-md border border-border-default py-14 text-center">
          <p className="text-sm font-medium text-text-primary">
            Could not load users
          </p>
          <p className="mt-1 text-[13px] text-text-tertiary">
            {getApiErrorMessage(error, "Failed to fetch users.")}
          </p>
        </EmptyState>
      ) : (
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
          emptyTitle="No admin users found"
          emptyDescription="Admin accounts will appear here."
          ariaLabel="Admin users table"
          minWidth="min-w-[56rem]"
          serverSide
          onRowAction={(id) => navigate(`/admin/users/${id}`)}
        />
      )}

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Admin</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4" autoComplete="off">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  required
                  type="text"
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.full_name}
                  onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  required
                  type="email"
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMut.isPending ? <Spinner size="sm" color="white" /> : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
