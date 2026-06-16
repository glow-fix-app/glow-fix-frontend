import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/react";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";

import { useClientDetail } from "@/features/admin/hooks/useClientDetail";
import { UserAvatar } from "@/components/ui/UserAvatar";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatTableDate } from "@/components/dashboard/DashboardTable";

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // We can reuse useClientDetail since it just calls adminApi.userById
  const { data: user, isLoading } = useClientDetail(userId);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-gray-500">
        <NoSymbolIcon className="h-12 w-12" />
        <p className="text-lg font-medium">Admin not found</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Back to Admin Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-[13px] text-gray-500">ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col p-6 gap-6">
          <div className="flex items-start gap-5">
            <UserAvatar
              user={{ fullName: user.full_name }}
              className="h-20 w-20 shrink-0 text-2xl font-bold ring-4 ring-gray-50"
              bg="bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600"
            />
            <div className="flex flex-col mt-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                <StatusBadge status={user.is_active ? "Active" : "Inactive"} />
                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                  {user.role}
                </span>
              </div>
              
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6 text-[13px] text-gray-600">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  {user.email}
                  {user.email_verified && <CheckCircleIcon className="h-4 w-4 text-emerald-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  {user.phone || "No phone provided"}
                  {user.phone && user.phone_verified && <CheckCircleIcon className="h-4 w-4 text-emerald-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                  Joined {formatTableDate(user.created_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-900">Permissions Overview</h3>
            <p className="mt-1 text-sm text-gray-500">
              This user has full administrative access to the platform. They can manage businesses, view analytics, and modify platform settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
