import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerApi } from "../../services/providerApi";
import { Link } from "react-router-dom";
import { Button, Card, Spinner, toast, Modal, Select, ListBox, Label } from "@heroui/react";
import { DocumentTextIcon, CheckCircleIcon, ExclamationCircleIcon, XCircleIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const DOCUMENT_TYPES = [
  { key: "BUSINESS_REGISTRATION", label: "Business Registration Certificate" },
  { key: "OWNER_ID", label: "Owner National ID" },
  { key: "INSURANCE_CERTIFICATE", label: "Insurance Certificate" },
  { key: "SERVICE_LICENSE", label: "Service License" },
];

export default function VerificationDocumentsTab() {
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["provider", "documents"],
    queryFn: providerApi.getDocuments,
  });

  const availableDocumentTypes = DOCUMENT_TYPES.filter(type => {
    const existing = documents.find(d => d.type === type.key);
    if (!existing) return true;
    const ctx = existing.status?.context || "PENDING_REVIEW";
    return ctx === "REJECTED"; // Only allow re-upload if rejected
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, type }) => providerApi.uploadDocument(file, type),
    onSuccess: () => {
      toast.success("Document uploaded successfully for review!");
      queryClient.invalidateQueries({ queryKey: ["provider", "documents"] });
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setSelectedType("");
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to upload document.";
      toast.danger(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedType) {
      toast.danger("Please select a document type.");
      return;
    }
    if (!selectedFile) {
      toast.danger("Please select a file to upload.");
      return;
    }
    uploadMutation.mutate({ file: selectedFile, type: selectedType });
  };

  const getStatusDisplay = (statusObj) => {
    if (!statusObj) return { label: "Unknown", color: "text-gray-500", icon: <ExclamationCircleIcon className="w-4 h-4 text-gray-500" /> };
    const ctx = statusObj.context || "PENDING";
    
    if (ctx === "ACCEPTED") {
      return { label: "Approved", color: "text-green-600", icon: <CheckCircleIcon className="w-4 h-4 text-green-600" /> };
    }
    if (ctx === "REJECTED") {
      return { label: "Rejected", color: "text-red-600", icon: <XCircleIcon className="w-4 h-4 text-red-600" /> };
    }
    return { label: "Pending Review", color: "text-yellow-600", icon: <ExclamationCircleIcon className="w-4 h-4 text-yellow-600" /> };
  };

  const getDocumentLabel = (typeKey) => {
    const found = DOCUMENT_TYPES.find(d => d.key === typeKey);
    return found ? found.label : typeKey;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:hidden mb-4">
        <Button 
          as={Link}
          to="/provider/settings"
          variant="light" 
          className="text-gray-500 font-medium px-0 gap-1 -ml-2"
          startContent={<span className="text-xl leading-none">←</span>}
        >
          Back to Settings
        </Button>
      </div>

      <Card className="border-none p-0 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary">Verification Documents</h2>
            <p className="text-[13px] text-text-secondary mt-1">Upload required documents to verify your business and unlock payouts.</p>
          </div>
          <Button 
            className="h-9 rounded-lg bg-brand-500 px-6 text-[12px] font-semibold text-white transition-all hover:bg-brand-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onPress={() => setIsUploadModalOpen(true)}
            isDisabled={availableDocumentTypes.length === 0}
            startContent={<DocumentTextIcon className="w-4 h-4" />}
          >
            + Upload Document
          </Button>
        </div>
        <div className="flex flex-col">
          {documents.length === 0 ? (
            <div className="p-8 text-[14px] text-text-secondary text-center bg-gray-50/50">
              No verification documents uploaded. Click above to add your first document.
            </div>
          ) : (
            documents.map((doc, index) => {
              const status = getStatusDisplay(doc.status);
              return (
                <div 
                  key={doc.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 hover:bg-gray-50/50 transition-colors ${index !== documents.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-text-primary">{getDocumentLabel(doc.type)}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text-', 'bg-')}`}></div>
                        <span className={`text-[12px] font-medium ${status.color}`}>{status.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Modal isOpen={isUploadModalOpen} onOpenChange={(val) => !val && setIsUploadModalOpen(false)}>
        <Modal.Backdrop variant="opaque">
          <Modal.Container className="flex items-center justify-center p-4">
            <Modal.Dialog className="w-full max-w-lg rounded-[28px] bg-white p-0 shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <Modal.Header className="flex flex-row items-center justify-between border-b border-gray-100 px-8 py-6 bg-white">
                <Modal.Heading className="text-[18px] text-text-primary leading-tight font-bold">
                  Upload Document
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="p-8 space-y-5">
                <div className="space-y-4">
                  <Select
                    className="w-full"
                    placeholder="Select document type"
                    selectedKeys={selectedType ? new Set([selectedType]) : new Set()}
                    onSelectionChange={(keys) => {
                      if (keys instanceof Set) {
                        setSelectedType(Array.from(keys)[0]);
                      } else {
                        setSelectedType(keys);
                      }
                    }}
                  >
                    <Label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1">Document Type</Label>
                    <Select.Trigger className="h-12 w-full rounded-xl border border-gray-300 px-5 text-[14px] font-normal transition-all outline-none bg-white text-text-primary focus:border-brand-500 flex items-center justify-between cursor-pointer">
                      <Select.Value />
                      <Select.Indicator>▼</Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover className="bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-[9999]">
                      <ListBox>
                        {availableDocumentTypes.map((type) => (
                          <ListBox.Item 
                            key={type.key} 
                            id={type.key} 
                            textValue={type.label}
                            className="px-3 py-2 text-[14px] hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            {type.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-50 hover:border-brand-300 transition-colors" onClick={() => document.getElementById('doc-upload')?.click()}>
                    <input 
                      id="doc-upload"
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mb-3" />
                    {selectedFile ? (
                      <p className="text-[14px] font-bold text-brand-600">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-[14px] font-bold text-text-primary">Click to upload or drag and drop</p>
                        <p className="text-[12px] text-text-muted mt-1">PDF, PNG, or JPG (max. 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-5">
                <Button variant="light" onPress={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="h-9 rounded-lg bg-brand-500 px-6 text-[12px] font-semibold text-white transition-all hover:bg-brand-600 cursor-pointer" onPress={handleUploadSubmit} isLoading={uploadMutation.isPending}>
                  Upload
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
