import React from "react";
import { Modal } from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function LightboxModal({ image, onClose }) {
  return (
    <Modal isOpen={!!image} onOpenChange={(val) => !val && onClose()}>
      <Modal.Backdrop variant="opaque" className="bg-black/85">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="w-full max-w-4xl rounded-2xl bg-transparent p-0 overflow-hidden shadow-none border-none relative">
            <button 
              type="button" 
              onClick={onClose} 
              className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <Modal.Body className="p-0 flex items-center justify-center max-h-[85vh]">
              <img 
                src={image} 
                alt="Full size preview" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
