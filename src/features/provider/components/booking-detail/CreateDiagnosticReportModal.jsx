import React, { useState } from "react";
import { 
  Modal, 
  Button, 
  toast, 
  Spinner,
  Label,
  ListBox,
  Select
} from "@heroui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerApi } from "../../services/providerApi";
import { getApiErrorMessage } from "@/services/apiResponse";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CreateDiagnosticReportModal({ isOpen, onClose, bookingId, businessId, onSuccess }) {
  const [summary, setSummary] = useState("");
  const [findings, setFindings] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [validHours, setValidHours] = useState("72");

  const { data: assignedServices, isLoading } = useQuery({
    queryKey: ["provider", "assignedServices", businessId],
    queryFn: () => providerApi.getAssignedServices(businessId),
    enabled: Boolean(businessId && isOpen),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => providerApi.createDiagnosticReport(data),
    onSuccess: () => {
      toast.success("Diagnostic report created successfully!");
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings", bookingId] });
      onClose();
    },
    onError: (err) => {
      toast.danger(getApiErrorMessage(err, "Failed to create report"));
    }
  });

  const handleAddFinding = () => {
    setFindings([...findings, { title: "", description: "", priority: "INFO" }]);
  };

  const handleRemoveFinding = (index) => {
    setFindings(findings.filter((_, i) => i !== index));
  };

  const handleFindingChange = (index, field, value) => {
    const newFindings = [...findings];
    newFindings[index][field] = value;
    setFindings(newFindings);
  };

  const handleAddRepair = () => {
    setRepairs([...repairs, { business_service_id: "", title: "", description: "", price: "", duration_minutes: "" }]);
  };

  const handleRemoveRepair = (index) => {
    setRepairs(repairs.filter((_, i) => i !== index));
  };

  const handleRepairChange = (index, field, value) => {
    const newRepairs = [...repairs];
    
    if (field === "business_service_id") {
      newRepairs[index][field] = value;
      // Auto-fill price, title, and duration if service is selected
      const selectedService = assignedServices?.find(s => s.id === value);
      if (selectedService) {
        if (!newRepairs[index].title) newRepairs[index].title = selectedService.service_title;
        if (!newRepairs[index].price) newRepairs[index].price = selectedService.price;
        if (!newRepairs[index].duration_minutes) newRepairs[index].duration_minutes = selectedService.duration_minutes || "";
      }
    } else {
      newRepairs[index][field] = value;
    }
    
    setRepairs(newRepairs);
  };

  const handleSubmit = () => {
    if (!summary.trim()) {
      toast.danger("Summary is required.");
      return;
    }

    // Validate repairs
    for (const r of repairs) {
      if (!r.business_service_id) {
        toast.danger("Please select a service for all recommended repairs.");
        return;
      }
    }

    // Validate findings
    for (const f of findings) {
      if (!f.title.trim()) {
        toast.danger("Please provide a title for all findings.");
        return;
      }
    }

    const payload = {
      booking_id: bookingId,
      summary,
      findings: findings.map(f => ({
        title: f.title,
        description: f.description || undefined,
        priority: f.priority
      })),
      recommended_repairs: repairs.map(r => ({
        business_service_id: r.business_service_id,
        title: r.title || undefined,
        description: r.description || undefined,
        price: Number(r.price) || 0,
        duration_minutes: r.duration_minutes ? Number(r.duration_minutes) : undefined
      })),
      estimated_duration: estimatedDuration ? Number(estimatedDuration) * 60 : undefined,
      valid_hours: validHours ? Number(validHours) : 72
    };

    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(val) => !val && onClose()}>
      <Modal.Backdrop variant="opaque">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="w-full max-w-3xl rounded-xl bg-white p-0 shadow-lg overflow-hidden border border-gray-200">
            <Modal.Header className="flex flex-row items-center justify-between border-b border-gray-100 px-6 py-4 bg-white">
              <div>
                <Modal.Heading className="text-[16px] text-gray-900 font-bold leading-tight">
                  Create Diagnostic Report
                </Modal.Heading>
                <p className="text-[12px] text-gray-500 mt-1">
                  Document your findings and recommend repairs to the client.
                </p>
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors animate-none"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </Modal.Header>
            
            <Modal.Body className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
              {/* Summary */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 mb-2">Summary Findings</h3>
                <textarea 
                  placeholder="Describe the overall condition and your diagnostic results..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <hr className="border-gray-200" />

              {/* Findings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-700">Specific Findings (Optional)</h3>
                  <Button 
                    size="sm" 
                    variant="bordered" 
                    onPress={handleAddFinding} 
                    endContent={<PlusIcon className="w-3.5 h-3.5" />}
                    className="rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    Add Finding
                  </Button>
                </div>
                
                <div className="space-y-2.5">
                  {findings.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No specific findings added.</p>
                  ) : (
                    findings.map((finding, idx) => (
                      <div key={idx} className="space-y-2 rounded-lg border border-gray-100 p-3">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text"
                              placeholder="e.g., Brake pads worn"
                              value={finding.title}
                              onChange={(e) => handleFindingChange(idx, "title", e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <input 
                              type="text"
                              placeholder="Description (optional)"
                              value={finding.description}
                              onChange={(e) => handleFindingChange(idx, "description", e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          
                          <Select
                            placeholder="Priority"
                            selectedKey={finding.priority || "INFO"}
                            onSelectionChange={(key) => handleFindingChange(idx, "priority", key)}
                            className="w-32 shrink-0"
                          >
                            <Label className="sr-only">Priority</Label>
                            <Select.Trigger className="flex h-10 items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer w-full text-left">
                              <Select.Value className="text-sm text-gray-800" />
                              <Select.Indicator className="text-gray-400 shrink-0" />
                            </Select.Trigger>
                            <Select.Popover className="rounded-lg border border-gray-200 bg-white shadow-lg p-1 outline-none min-w-[120px] z-50">
                              <ListBox className="outline-none">
                                <ListBox.Item id="INFO" textValue="Info" className="cursor-pointer rounded-md px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-600 flex items-center justify-between">
                                  <span>Info</span>
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="WARNING" textValue="Warning" className="cursor-pointer rounded-md px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-600 flex items-center justify-between">
                                  <span>Warning</span>
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="CRITICAL" textValue="Critical" className="cursor-pointer rounded-md px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-600 flex items-center justify-between">
                                  <span>Critical</span>
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              </ListBox>
                            </Select.Popover>
                          </Select>

                          <Button 
                            isIconOnly 
                            variant="light" 
                            onPress={() => handleRemoveFinding(idx)}
                            className="rounded-lg p-2 h-10 text-gray-400 hover:bg-gray-50 hover:text-rose-600 transition-colors shrink-0"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Recommended Repairs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-700">Recommended Repairs</h3>
                  <Button 
                    size="sm" 
                    variant="bordered" 
                    onPress={handleAddRepair} 
                    endContent={<PlusIcon className="w-3.5 h-3.5" />}
                    className="rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    Add Repair
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" color="secondary" />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {repairs.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No repairs recommended yet.</p>
                    ) : (
                      repairs.map((repair, idx) => (
                        <div key={idx} className="space-y-2 rounded-lg border border-gray-100 p-3">
                          <div className="flex gap-2 items-start">
                            <Select
                              placeholder="Select a service..."
                              selectedKey={repair.business_service_id || ""}
                              onSelectionChange={(key) => handleRepairChange(idx, "business_service_id", key)}
                              className="flex-1"
                            >
                              <Label className="sr-only">Service</Label>
                              <Select.Trigger className="flex h-10 items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer w-full text-left">
                                <Select.Value className="text-sm text-gray-800" />
                                <Select.Indicator className="text-gray-400 shrink-0" />
                              </Select.Trigger>
                              <Select.Popover className="w-[var(--trigger-width)] rounded-lg border border-gray-200 bg-white shadow-lg p-1 outline-none z-50">
                                <ListBox className="max-h-60 overflow-y-auto outline-none">
                                    {assignedServices?.map(service => (
                                      <ListBox.Item 
                                        key={service.id} 
                                        id={service.id} 
                                        textValue={`${service.service_title} (EGP ${service.price})`}
                                        className="cursor-pointer rounded-md px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none data-[focused=true]:bg-gray-100 data-[selected=true]:bg-purple-50 data-[selected=true]:text-purple-600 flex items-center justify-between"
                                      >
                                        <span>{service.service_title} (EGP {service.price})</span>
                                        <ListBox.ItemIndicator />
                                      </ListBox.Item>
                                    ))}
                                  </ListBox>
                                </Select.Popover>
                              </Select>
                              
                              <Button 
                                isIconOnly 
                                variant="light" 
                                onPress={() => handleRemoveRepair(idx)}
                                className="rounded-lg p-2 h-10 text-gray-400 hover:bg-gray-50 hover:text-rose-600 transition-colors shrink-0"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <input 
                                type="text"
                                placeholder="Title (optional)"
                                value={repair.title || ""}
                                onChange={(e) => handleRepairChange(idx, "title", e.target.value)}
                                className="rounded-lg border border-gray-200 px-3 py-2 h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                              />
                              <div className="relative flex items-center">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                  <span className="text-[11px] text-gray-400 font-bold leading-none select-none">EGP</span>
                                </div>
                                <input 
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="Price"
                                  value={repair.price !== undefined ? String(repair.price) : ""}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    handleRepairChange(idx, "price", val);
                                  }}
                                  className="w-full pl-11 pr-3 h-10 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                />
                              </div>
                              <div className="relative flex items-center">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                  <span className="text-[11px] text-gray-400 font-bold leading-none select-none">Min</span>
                                </div>
                                <input 
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="Duration"
                                  value={repair.duration_minutes !== undefined ? String(repair.duration_minutes) : ""}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    handleRepairChange(idx, "duration_minutes", val);
                                  }}
                                  className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                />
                              </div>
                            </div>

                            <input 
                              type="text"
                              placeholder="Description (optional)"
                              value={repair.description || ""}
                              onChange={(e) => handleRepairChange(idx, "description", e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                            />
                          </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <hr className="border-gray-200" />

              {/* Estimated Duration & Valid Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2 block">Estimated Duration (hours)</label>
                  <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g., 4"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2 block">Valid For (hours)</label>
                  <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="72"
                    value={validHours}
                    onChange={(e) => setValidHours(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </Modal.Body>
            
            <Modal.Footer className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <Button 
                variant="flat" 
                onPress={onClose} 
                className="rounded-lg h-9 px-4 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit} 
                isLoading={mutation.isPending}
                className="rounded-lg h-9 px-5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Report
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
