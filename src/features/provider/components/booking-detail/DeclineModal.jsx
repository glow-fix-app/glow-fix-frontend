import React from "react";
import { Modal, Button } from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function DeclineModal({ isOpen, onClose, rejectReason, setRejectReason, handleReject, isMutating }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={(val) => !val && onClose()}>
      <Modal.Backdrop variant="opaque">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="w-full max-w-lg rounded-[24px] bg-white p-0 shadow-2xl overflow-hidden border">
            <Modal.Header className="flex flex-row items-center justify-between border-b border-gray-100 px-8 py-6 bg-white">
              <div>
                <Modal.Heading className="text-[18px] text-rose-600 font-bold leading-tight">
                  Decline Request
                </Modal.Heading>
                <p className="text-[13px] text-gray-500 mt-1">
                  Explain why this booking request cannot be serviced.
                </p>
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Modal.Header>
            <Modal.Body className="p-8 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Please provide a clear reason for declining. The customer will receive this explanation so they can adjust their details or select another provider.
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Decline Reason</label>
                <textarea
                  className="w-full rounded-xl border border-gray-300 p-3.5 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all shadow-sm"
                  rows="4"
                  placeholder="e.g., We are fully booked at this time, or we do not service this vehicle type."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-5">
              <Button 
                variant="flat" 
                onPress={onClose} 
                className="rounded-xl h-11 px-5 text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button 
                color="danger" 
                onPress={handleReject} 
                isLoading={isMutating}
                className="rounded-xl h-11 px-6 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20"
              >
                Confirm Decline
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
