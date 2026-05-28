import { Modal, Button } from "@heroui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function VehicleDeleteModal({ vehicle, isOpen, onClose, onConfirm, isPending }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={(val) => !val && onClose()}>
      <Modal.Backdrop variant="opaque">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="w-full max-w-sm rounded-2xl bg-white p-0 shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <Modal.Body className="p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <ExclamationTriangleIcon className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary">Delete vehicle?</h3>
                <p className="mt-1 text-[13px] text-text-tertiary">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-text-primary">
                    {vehicle?.year} {vehicle?.model}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="flat"
                  className="h-10 rounded-xl px-6 text-[13px] bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onPress={onClose}
                  isDisabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="h-10 rounded-xl bg-red-500 px-6 text-[13px] font-semibold text-white hover:bg-red-600"
                  onPress={onConfirm}
                  isLoading={isPending}
                >
                  Delete
                </Button>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
