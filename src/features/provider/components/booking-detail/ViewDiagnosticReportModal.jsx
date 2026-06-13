import React from "react";
import { Modal, Button } from "@heroui/react";
import { XMarkIcon, PencilSquareIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const priorityColors = {
  CRITICAL: { bg: "bg-red-50", dot: "bg-red-500", text: "text-red-700", label: "Critical" },
  WARNING: { bg: "bg-amber-50", dot: "bg-amber-500", text: "text-amber-700", label: "Warning" },
  INFO: { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-700", label: "Info" },
};

export default function ViewDiagnosticReportModal({ isOpen, onClose, report, onEdit }) {
  if (!report) return null;

  const totalCost = report.recommended_repairs?.reduce((sum, r) => sum + (Number(r.price) || 0), 0) || 0;

  return (
    <Modal isOpen={isOpen} onOpenChange={(val) => !val && onClose()}>
      <Modal.Backdrop variant="opaque">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="w-full max-w-2xl rounded-xl bg-white p-0 shadow-lg overflow-hidden border border-gray-200">
            <Modal.Header className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Modal.Heading className="text-[16px] text-gray-900 font-bold leading-tight">
                    Diagnostic Report
                  </Modal.Heading>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Created {new Date(report.created_at || report.createdAt).toLocaleDateString("en-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={onEdit}
                  className="rounded-lg h-8 px-3 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </Modal.Header>

            <Modal.Body className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Summary</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
                </div>
              </div>

              {/* Findings */}
              {report.findings?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Findings ({report.findings.length})
                  </h3>
                  <div className="space-y-2">
                    {report.findings.map((f, i) => {
                      const colors = priorityColors[f.priority] || priorityColors.INFO;
                      return (
                        <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-3.5">
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colors.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{f.title}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                                {colors.label}
                              </span>
                            </div>
                            {f.description && (
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Repairs */}
              {report.recommended_repairs?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Recommended Repairs ({report.recommended_repairs.length})
                  </h3>
                  <div className="space-y-2">
                    {report.recommended_repairs.map((r, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{r.title || "Repair Service"}</p>
                          {r.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                          )}
                          {r.duration_minutes && (
                            <p className="text-[11px] text-gray-400 mt-1">{r.duration_minutes} min</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-bold text-gray-900">EGP {Number(r.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals & Meta */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Total Repair Cost</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">EGP {totalCost.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Valid Until</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">
                    {report.valid_until
                      ? new Date(report.valid_until).toLocaleDateString("en-EG", { year: "numeric", month: "short", day: "numeric" })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <Button
                variant="flat"
                onPress={onClose}
                className="rounded-lg h-9 px-4 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Close
              </Button>
              <Button
                color="primary"
                onPress={onEdit}
                className="rounded-lg h-9 px-5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Edit Report
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}