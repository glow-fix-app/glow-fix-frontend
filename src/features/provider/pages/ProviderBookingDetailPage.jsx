import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, Card, Button, toast } from "@heroui/react";
import { getLocalTimeZone } from "@internationalized/date";
import { providerApi } from "../services/providerApi";
import ChatWindow from "@/features/chat/components/ChatWindow";
import { getGlobalChatSocket, chatApi } from "@/features/chat/services/chatApi";

// Import Modular Sub-components
import BookingHeader from "../components/booking-detail/BookingHeader";
import BookingSummaryCard from "../components/booking-detail/BookingSummaryCard";
import CustomerVehicleCard from "../components/booking-detail/CustomerVehicleCard";
import RequestedServicesCard from "../components/booking-detail/RequestedServicesCard";
import IssueDetailsCard from "../components/booking-detail/IssueDetailsCard";
import ActionCard from "../components/booking-detail/ActionCard";
import InspectionReportCard from "../components/booking-detail/InspectionReportCard";
import PaymentCard from "../components/booking-detail/PaymentCard";
import DeclineModal from "../components/booking-detail/DeclineModal";
import LightboxModal from "../components/booking-detail/LightboxModal";
import CreateDiagnosticReportModal from "../components/booking-detail/CreateDiagnosticReportModal";
import ViewDiagnosticReportModal from "../components/booking-detail/ViewDiagnosticReportModal";

export default function ProviderBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // States
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [editablePrices, setEditablePrices] = useState({});

  // Query: Booking Details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["provider", "bookings", id],
    queryFn: () => providerApi.managerBookingDetails(id),
  });

  // Query: Diagnostic Report
  const { data: reportData } = useQuery({
    queryKey: ["provider", "diagnostic-report", id],
    queryFn: () => providerApi.getDiagnosticReport(id),
    enabled: Boolean(id),
    retry: false,
    staleTime: 30 * 1000,
  });

  // Query: Chat Conversation (per-client across all bookings)
  const clientUserId = booking?.vehicle?.client?.user?.id;
  const { data: conversation, isLoading: chatLoading } = useQuery({
    queryKey: ["clientConversation", clientUserId],
    queryFn: () => chatApi.directConversation(clientUserId),
    enabled: Boolean(clientUserId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const socket = getGlobalChatSocket();

  // Mutation: Review Booking (Accept/Decline)
  const reviewMutation = useMutation({
    mutationFn: (data) => providerApi.reviewBooking(id, data),
    onSuccess: () => {
      toast.success("Booking updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings", id] });
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
      setIsDeclineOpen(false);
    },
    onError: (err) => {
      const msg = err.response?.data?.message;
      toast.danger(Array.isArray(msg) ? msg.join(', ') : (msg || "Failed to review booking"));
    }
  });

  // Mutation: Update Status
  const statusMutation = useMutation({
    mutationFn: (data) => providerApi.updateBookingStatus(id, data),
    onSuccess: () => {
      toast.success("Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings", id] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message;
      toast.danger(Array.isArray(msg) ? msg.join(', ') : (msg || "Failed to update status"));
    }
  });

  // Initialize editable prices
  useEffect(() => {
    if (booking && booking.items?.length > 0 && Object.keys(editablePrices).length === 0) {
      const initPrices = {};
      booking.items.forEach(item => {
        initPrices[item.businessServiceId] = parseFloat(item.price);
      });
      setEditablePrices(initPrices);
    }
  }, [booking, editablePrices]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Spinner size="lg" color="primary" label="Loading booking details..." className="font-semibold text-gray-500" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold bg-red-50 border border-red-200 rounded-2xl max-w-xl mx-auto my-12">
        Failed to load booking details. Please try again or return to the dashboard.
        <Button className="mt-4 block mx-auto bg-red-600 text-white font-bold" onPress={() => navigate("/provider")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const { vehicle, items = [], note, images = [], status, created_at, scheduled_at, expected_delivery_at, total_price, payment, diagnostic_report: bookingReport } = booking;
  const diagnosticReport = bookingReport || reportData;
  const currentStatus = status || "PENDING";
  const isPending = currentStatus === "PENDING";

  // Handlers
  const handlePriceChange = (bsId, value) => {
    setEditablePrices(prev => ({ ...prev, [bsId]: value }));
  };

  const handleAccept = () => {
    if (!deliveryDate || !deliveryTime) {
      toast.danger("Please select an expected delivery date and time.");
      return;
    }

    const payload = {
      status: "ACCEPTED",
      items: Object.entries(editablePrices).map(([businessServiceId, price]) => ({
        businessServiceId,
        price: parseFloat(price) || 0
      }))
    };

    try {
      const mergedDate = new Date(`${deliveryDate}T${deliveryTime}:00`);
      payload.expectedDeliveryAt = mergedDate.toISOString();
    } catch (err) {
      console.error("Error formatting delivery date: ", err);
      toast.danger("Invalid delivery date format.");
      return;
    }

    reviewMutation.mutate(payload);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.danger("Please provide a reason for rejection");
      return;
    }
    reviewMutation.mutate({
      status: "REJECTED",
      rejectionReason: rejectReason
    });
  };

  const handleStartInspection = () => {
    setIsReportModalOpen(true);
  };

  const handleCancelBooking = () => {
    statusMutation.mutate({ status: "CANCELLED" });
  };

  // Chat parameters
  const chatEnabled = !["CANCELLED", "COMPLETED", "REJECTED"].includes(currentStatus);
  const conversationId = conversation?.id ?? null;
  const conversationInfo = conversation
    ? {
        name:
          conversation.name ||
          conversation.participants
            ?.filter((p) => p.role === "CLIENT")
            .map((p) => p.user?.fullName ?? p.fullName ?? p.name)
            .filter(Boolean)
            .join(", ") ||
          (vehicle?.client?.user?.fullName || "Client"),
      }
    : null;

  return (
    <div className="w-full pb-16 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <BookingHeader 
        id={booking.id}
        status={currentStatus}
        paymentStatus={payment?.status?.context || "PENDING"}
        navigate={navigate}
        onUpdateStatus={(newStatus) => {
          if (newStatus !== currentStatus) {
            statusMutation.mutate({ status: newStatus });
          }
        }}
      />

      {/* Unified 5-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Column - Details and Actions */}
        <div className="lg:col-span-3 space-y-6">
          <BookingSummaryCard 
            id={booking.id}
            items={items}
            scheduledAt={scheduled_at}
            expectedDeliveryAt={expected_delivery_at}
          />

          <CustomerVehicleCard 
            client={vehicle?.client}
            vehicle={vehicle}
          />

          <RequestedServicesCard 
            items={items}
            isPending={isPending}
            editablePrices={editablePrices}
            handlePriceChange={handlePriceChange}
            totalPrice={total_price}
          />

          <IssueDetailsCard 
            note={note}
            images={images}
            onImageClick={setLightboxImage}
          />

          {/* Conditional Workflow Panel */}
          {isPending ? (
            <ActionCard 
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              deliveryTime={deliveryTime}
              setDeliveryTime={setDeliveryTime}
              handleAccept={handleAccept}
              onOpenDecline={() => setIsDeclineOpen(true)}
              isMutating={reviewMutation.isPending}
            />
          ) : (
            <>
              <InspectionReportCard 
                status={currentStatus}
                report={diagnosticReport}
                onStartInspection={handleStartInspection}
                onViewReport={() => setIsViewReportOpen(true)}
                isUpdating={statusMutation.isPending}
              />

              <PaymentCard 
                totalPrice={total_price}
                payment={payment}
              />

              {!["COMPLETED", "CANCELLED", "REJECTED"].includes(currentStatus) && (
                <div className="pt-2">
                  <Button 
                    color="danger"
                    className="rounded-xl h-10 px-5 font-bold shadow-sm bg-rose-600 text-white hover:bg-rose-700"
                    isLoading={statusMutation.isPending}
                    onPress={handleCancelBooking}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Live Chat */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-none overflow-hidden flex flex-col h-[560px]">
            {chatLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner size="sm" color="primary" label="Loading chat..." />
              </div>
            ) : (
              <ChatWindow
                selectedChatId={conversationId}
                selectedChatInfo={
                  conversationInfo ?? { name: vehicle?.client?.user?.fullName ?? "Client" }
                }
                showBack={false}
                socket={socket}
                inputDisabled={!chatEnabled || !conversationId}
                inputPlaceholder={
                  !conversationId
                    ? "Starting chat..."
                    : !chatEnabled
                    ? "This booking is closed"
                    : "Message your customer..."
                }
                statusLabel="Booking chat"
                emptyTitle="Booking chat"
                emptyDescription="Send a message to your customer about this booking."
              />
            )}
          </Card>
        </div>

      </div>

      {/* Decline Dialog Modal */}
      <DeclineModal 
        isOpen={isDeclineOpen}
        onClose={() => setIsDeclineOpen(false)}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
        isMutating={reviewMutation.isPending}
      />

      {/* Image Preview Lightbox Modal */}
      <LightboxModal 
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Diagnostic Report Modal */}
      <CreateDiagnosticReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        bookingId={booking.id}
        businessId={booking.business_id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["provider", "bookings", id] });
          queryClient.invalidateQueries({ queryKey: ["provider", "diagnostic-report", id] });
        }}
      />

      <ViewDiagnosticReportModal
        isOpen={isViewReportOpen}
        onClose={() => setIsViewReportOpen(false)}
        report={diagnosticReport}
        onEdit={() => {
          setIsViewReportOpen(false);
          setIsReportModalOpen(true);
        }}
      />

    </div>
  );
}
