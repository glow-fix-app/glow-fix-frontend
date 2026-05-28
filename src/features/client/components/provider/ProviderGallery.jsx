import { useState } from "react";
import { Card, Modal, Button } from "@heroui/react";
import { PhotoIcon } from "@heroicons/react/24/outline";

export default function ProviderGallery({ gallery = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (idx) => {
    setFailedImages((prev) => ({ ...prev, [idx]: true }));
  };

  const handleImageClick = (url) => {
    setActiveImage(url);
    setIsOpen(true);
  };

  if (!gallery || gallery.length === 0) return null;

  return (
    <>
      <Card className="border-none p-5 shadow-none ring-1 ring-black/[0.06] lg:col-span-2">
        <h3 className="text-[15px] font-bold text-text-primary">Gallery</h3>
        <p className="mt-1 text-[13px] text-text-muted">Browse photos of our facility and premium service delivery.</p>
        
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {gallery.map((url, idx) => {
            const hasFailed = failedImages[idx];
            return (
              <div 
                key={idx} 
                onClick={() => !hasFailed && handleImageClick(url)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 transition-all duration-300 ${hasFailed ? 'cursor-default ring-1 ring-black/[0.04]' : 'cursor-pointer hover:shadow-sm'}`}
              >
                {hasFailed ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 p-3 text-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <PhotoIcon className="h-4.5 w-4.5 text-text-muted" />
                    </span>
                    <span className="mt-1.5 text-[10px] font-semibold tracking-wider uppercase text-text-muted">Unavailable</span>
                  </div>
                ) : (
                  <>
                    <img 
                      src={url} 
                      alt={`Workshop gallery ${idx + 1}`} 
                      onError={() => handleImageError(idx)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 z-10 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop className="bg-black/80 backdrop-blur-sm">
          <Modal.Container className="flex items-center justify-center p-4">
            <Modal.Dialog className="relative max-h-[90vh] max-w-[90vw] lg:max-w-4xl rounded-2xl bg-white/5 p-1 border-none shadow-none">
              <Modal.Body className="p-0 flex items-center justify-center relative">
                <img 
                  src={activeImage} 
                  alt="Fullscreen workshop view" 
                  className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain ring-4 ring-white/10"
                />
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  slot="close"
                  className="absolute right-4 top-4 bg-black/60 hover:bg-black text-white rounded-full z-50 p-1.5 min-w-0 h-8 w-8 flex items-center justify-center"
                >
                  ✕
                </Button>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
