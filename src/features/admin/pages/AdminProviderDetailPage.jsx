import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, Modal, Button } from "@heroui/react";
import {
  ShieldCheckIcon,
  StarIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon as ShieldSolid } from "@heroicons/react/24/solid";

import { adminApi } from "@/features/admin/services/adminApi";
import { chatApi } from "@/features/chat/services/chatApi";
import { UserAvatar } from "@/components/ui/UserAvatar";
import StatusBadge from "@/components/ui/StatusBadge";
import DashboardTable, {
  formatTableDate,
  TableCellText,
} from "@/components/dashboard/DashboardTable";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n ?? 0);

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "reviews", label: "Reviews" },
  { id: "documents", label: "Documents" },
  { id: "payouts", label: "Payouts" },
];

const BOOKING_COLUMNS = [
  { id: "reference", name: "ID", isRowHeader: true },
  { id: "customer_name", name: "Customer" },
  { id: "service_name", name: "Service" },
  { id: "scheduled_at", name: "Date" },
  { id: "total_price", name: "Amount" },
  { id: "current_status", name: "Status" },
];

const REVIEW_STARS = (rating) =>
  Array.from({ length: 5 }).map((_, i) => (
    <StarIcon
      key={i}
      className={`h-4 w-4 ${i < rating ? "fill-orange-400 text-orange-400" : "text-gray-200"}`}
    />
  ));

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-[12px] font-medium text-gray-500">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminProviderDetailPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: "",
    contactPhone: "",
    contactEmail: "",
    city: "",
    address: "",
  });
  
  const [rejectDocModal, setRejectDocModal] = useState({ isOpen: false, docId: null, reason: "" });

  const [bookingPage, setBookingPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  // ── queries
  const { data: business, isLoading } = useQuery({
    queryKey: ["admin", "business", businessId],
    queryFn: () => adminApi.businessById(businessId),
    enabled: !!businessId,
  });

  const { data: bookingsRes, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin", "business", businessId, "bookings", bookingPage],
    queryFn: () => adminApi.businessBookings(businessId, { page: bookingPage, limit: 8 }),
    enabled: !!businessId && activeTab === "bookings",
  });

  const { data: reviewsRes, isLoading: reviewsLoading } = useQuery({
    queryKey: ["admin", "business", businessId, "reviews", reviewPage],
    queryFn: () => adminApi.businessReviews(businessId, { page: reviewPage, limit: 8 }),
    enabled: !!businessId && activeTab === "reviews",
  });

  // ── mutations
  const approveMut = useMutation({
    mutationFn: () => adminApi.approveBusiness(businessId, {}),
    onSuccess: () => queryClient.invalidateQueries(["admin", "business", businessId]),
  });
  const rejectMut = useMutation({
    mutationFn: () => adminApi.rejectBusiness(businessId, { reason: "Admin action" }),
    onSuccess: () => queryClient.invalidateQueries(["admin", "business", businessId]),
  });

  const approveDocMut = useMutation({
    mutationFn: (docId) => adminApi.approveDocument(businessId, docId),
    onSuccess: () => queryClient.invalidateQueries(["admin", "business", businessId]),
  });

  const rejectDocMut = useMutation({
    mutationFn: ({ docId, reason }) => adminApi.rejectDocument(businessId, docId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "business", businessId]);
      setRejectDocModal({ isOpen: false, docId: null, reason: "" });
    },
  });

  const handleApproveAll = async () => {
    if (!business?.documents) return;
    const pendingDocs = business.documents.filter(d => d.status?.context === "PENDING_REVIEW");
    for (const doc of pendingDocs) {
      await approveDocMut.mutateAsync(doc.id);
    }
  };

  const updateMut = useMutation({
    mutationFn: (data) => adminApi.updateBusiness(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "business", businessId]);
      setIsEditOpen(false);
    },
  });

  const handleEditOpen = () => {
    if (business) {
      setEditForm({
        businessName: business.businessName || "",
        contactPhone: business.contactPhone || "",
        contactEmail: business.contactEmail || "",
        city: business.city || "",
        address: business.address || "",
      });
      setIsEditOpen(true);
    }
  };

  const handleEditSubmit = () => {
    updateMut.mutate(editForm);
  };

  const startChatMut = useMutation({
    mutationFn: async () => {
      if (!business?.manager?.id) throw new Error("No manager found for this provider");
      return chatApi.directConversation(business.manager.id);
    },
    onSuccess: (conv) => {
      navigate(`/admin/chat?id=${conv.id}`);
    },
    onError: (err) => {
      alert("Failed to start chat: " + err.message);
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-500">
        <p className="font-medium">Provider not found</p>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-500 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const currentStatus = business.current_status || business.statusHistory?.[0]?.status?.context || "PENDING_REVIEW";
  const isApproved = currentStatus === "APPROVED";

  // ── booking table renderer
  const renderBookingCell = (item, col) => {
    switch (col) {
      case "reference":
        return <span className="font-mono text-[13px] font-medium text-blue-600">{item.reference}</span>;
      case "scheduled_at":
        return <TableCellText muted>{formatTableDate(item.scheduled_at)}</TableCellText>;
      case "total_price":
        return <TableCellText strong>{fmt(item.total_price)}</TableCellText>;
      case "current_status":
        return <StatusBadge status={item.current_status} />;
      default:
        return <TableCellText muted>{item[col]}</TableCellText>;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Providers
      </button>

      {/* ── Header card ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: avatar + info */}
          <div className="flex items-start gap-4">
            <UserAvatar
              user={{ fullName: business.businessName }}
              className="h-16 w-16 shrink-0 rounded-xl text-lg font-semibold"
              bg="bg-blue-50 text-blue-600"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{business.businessName}</h1>
                {isApproved && <ShieldSolid className="h-5 w-5 text-blue-500" />}
                <StatusBadge status={currentStatus} />
              </div>
              <p className="mt-0.5 text-[14px] text-gray-500">{business.manager?.fullName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-gray-500">
                {business.manager?.email && (
                  <span className="flex items-center gap-1.5">
                    <EnvelopeIcon className="h-4 w-4" />
                    {business.manager.email}
                  </span>
                )}
                {business.manager?.phone && (
                  <span className="flex items-center gap-1.5">
                    <PhoneIcon className="h-4 w-4" />
                    {business.manager.phone}
                  </span>
                )}
                {business.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4" />
                    {business.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {currentStatus !== "APPROVED" && (
              <button
                onClick={() => approveMut.mutate()}
                disabled={approveMut.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Approve
              </button>
            )}
            <button 
              onClick={handleEditOpen}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit
            </button>
            <button 
              onClick={() => startChatMut.mutate()}
              disabled={startChatMut.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {startChatMut.isPending ? <Spinner size="sm" /> : <ChatBubbleLeftRightIcon className="h-4 w-4" />}
              Chat
            </button>
            {currentStatus === "APPROVED" && (
              <button
                onClick={() => rejectMut.mutate()}
                disabled={rejectMut.isPending}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
              >
                <NoSymbolIcon className="h-4 w-4" />
                Suspend
              </button>
            )}
          </div>
        </div>

        {/* ── Stat pills ── */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill icon={CalendarDaysIcon} label="Total Bookings" value={business.total_bookings ?? 0} color="blue" />
          <StatPill icon={CurrencyDollarIcon} label="Total Revenue" value={fmt(business.total_revenue)} color="green" />
          <StatPill
            icon={StarIcon}
            label="Avg. Rating"
            value={business.average_rating > 0 ? business.average_rating.toFixed(1) : "N/A"}
            color="orange"
          />
          <StatPill
            icon={DocumentTextIcon}
            label="Documents"
            value={business.documents?.length ?? 0}
            color="purple"
          />
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab content ───────────────────────────────────────────── */}

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Business info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[14px] font-semibold text-gray-800">Business Information</h2>
            <dl className="space-y-3">
              {[
                { label: "Business Name", value: business.businessName },
                { label: "Address", value: business.address },
                { label: "City", value: business.city },
                { label: "Contact Email", value: business.contactEmail },
                { label: "Contact Phone", value: business.contactPhone },
                { label: "Description", value: business.description },
                { label: "Registered", value: formatTableDate(business.createdAt) },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-[13px] text-gray-500 shrink-0">{label}</dt>
                    <dd className="text-[13px] font-medium text-gray-800 text-right">{value}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </div>

          {/* Operating hours */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[14px] font-semibold text-gray-800">Operating Hours</h2>
            {business.operatingHours?.length > 0 ? (
              <dl className="space-y-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
                  const h = business.operatingHours.find((o) => o.dayOfWeek === i);
                  return (
                    <div key={day} className="flex justify-between text-[13px]">
                      <dt className="text-gray-500">{day}</dt>
                      <dd className={h?.openTime ? "font-medium text-gray-800" : "text-gray-400"}>
                        {h?.openTime ? `${h.openTime} – ${h.closeTime}` : "Closed"}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            ) : (
              <p className="text-[13px] text-gray-400">No operating hours set.</p>
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS */}
      {activeTab === "bookings" && (
        <DashboardTable
          columns={BOOKING_COLUMNS}
          data={bookingsRes?.data ?? []}
          isLoading={bookingsLoading}
          page={bookingPage}
          rowsPerPage={8}
          totalItems={bookingsRes?.meta?.total}
          totalPages={bookingsRes?.meta?.total_pages}
          onPageChange={setBookingPage}
          renderCell={renderBookingCell}
          emptyTitle="No bookings yet"
          emptyDescription="This provider has not received any bookings."
          ariaLabel="Provider bookings"
          minWidth="min-w-[48rem]"
          serverSide
        />
      )}

      {/* REVIEWS */}
      {activeTab === "reviews" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {reviewsLoading ? (
            <div className="flex justify-center py-12"><Spinner size="md" /></div>
          ) : reviewsRes?.data?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {reviewsRes.data.map((review) => (
                <div key={review.id} className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        user={{ fullName: review.customer_name }}
                        className="h-8 w-8 text-[10px] shrink-0"
                        bg="bg-gray-100 text-gray-600"
                      />
                      <span className="text-[14px] font-semibold text-gray-800">{review.customer_name}</span>
                    </div>
                    <span className="text-[12px] text-gray-400">{formatTableDate(review.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1 mb-2">
                    {REVIEW_STARS(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-[13px] text-gray-600">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <StarIcon className="h-10 w-10 mb-3" />
              <p className="text-sm font-medium">No reviews yet</p>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-[14px] font-semibold text-gray-800">Verification Documents</h2>
            {business?.documents?.some(d => d.status?.context === "PENDING_REVIEW") && (
              <button
                onClick={handleApproveAll}
                disabled={approveDocMut.isPending}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-[13px] font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                Approve All
              </button>
            )}
          </div>
          {business.documents?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {business.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">
                      {doc.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      Uploaded {formatTableDate(doc.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.status?.context ?? "PENDING"} />
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium text-blue-500 hover:underline"
                    >
                      Preview
                    </a>
                    <button
                      onClick={() => approveDocMut.mutate(doc.id)}
                      disabled={approveDocMut.isPending || doc.status?.context === "APPROVED"}
                      className="text-[13px] font-medium text-emerald-600 hover:underline disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectDocModal({ isOpen: true, docId: doc.id, reason: "" })}
                      disabled={rejectDocMut.isPending || doc.status?.context === "REJECTED"}
                      className="text-[13px] font-medium text-red-500 hover:underline disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <DocumentTextIcon className="h-10 w-10 mb-3" />
              <p className="text-sm font-medium">No documents submitted</p>
            </div>
          )}
        </div>
      )}

      {/* PAYOUTS */}
      {activeTab === "payouts" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden p-14 flex flex-col items-center justify-center text-gray-400">
          <CurrencyDollarIcon className="h-10 w-10 mb-3" />
          <p className="text-sm font-medium">No payouts history</p>
        </div>
      )}

      {/* Edit Modal (Tailwind Native) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-[18px] font-bold text-gray-900">Edit Provider</h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-gray-700">Business Name</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-gray-700">Contact Phone</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={editForm.contactPhone}
                  onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-gray-700">Contact Email</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={editForm.contactEmail}
                  onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-gray-700">City</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-gray-700">Full Address</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button 
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                disabled={updateMut.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit}
                disabled={updateMut.isPending}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-[14px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {updateMut.isPending ? <Spinner size="sm" color="white" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Document Modal */}
      {rejectDocModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-[18px] font-bold text-gray-900">Reject Document</h3>
              <button 
                onClick={() => setRejectDocModal({ isOpen: false, docId: null, reason: "" })}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-gray-700">Reason for Rejection</label>
                <textarea
                  value={rejectDocModal.reason}
                  onChange={(e) => setRejectDocModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Document is blurry, expired, etc."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setRejectDocModal({ isOpen: false, docId: null, reason: "" })}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectDocMut.mutate({ docId: rejectDocModal.docId, reason: rejectDocModal.reason })}
                disabled={rejectDocMut.isPending || !rejectDocModal.reason.trim()}
                className="rounded-lg bg-red-600 px-5 py-2 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {rejectDocMut.isPending ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
