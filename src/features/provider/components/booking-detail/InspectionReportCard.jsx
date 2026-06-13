import React from "react";
import { Button, Card } from "@heroui/react";
import { DocumentTextIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function InspectionReportCard({ status, report, onStartInspection, onViewReport, isUpdating }) {

  const getCardDescription = () => {
    if (report) {
      return "Diagnostic report has been created. View the full report or create a revised version.";
    }
    return "Start by inspecting the vehicle to identify problems and create a diagnostic report.";
  };

  const getButton = () => {
    if (report) {
      return (
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            onPress={onViewReport}
            className="font-semibold px-4 h-9 text-xs rounded-xl shadow-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1.5"
          >
            <EyeIcon className="w-3.5 h-3.5" />
            View Report
          </Button>
          <Button
            color="primary"
            isLoading={isUpdating}
            className="font-semibold px-4 h-9 text-xs rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 transition-all flex items-center gap-1.5"
            onPress={onStartInspection}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            New Report
          </Button>
        </div>
      );
    }

    if (["PENDING", "CANCELLED", "REJECTED"].includes(status)) return null;

    return (
      <Button
        color="primary"
        isLoading={isUpdating}
        className="font-semibold px-5 h-9 text-xs rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 transition-all"
        onPress={onStartInspection}
      >
        Create Diagnostic Report
      </Button>
    );
  };

  return (
    <Card className="p-6 border border-gray-100 bg-white hover:border-gray-200/80 hover:shadow-md transition-all duration-300 rounded-2xl">
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm flex-shrink-0">
          <DocumentTextIcon className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-800 font-semibold text-sm">Inspection & Report</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed font-normal">
            {getCardDescription()}
          </p>
        </div>
      </div>

      <div className="flex justify-start pl-13">
        {getButton()}
      </div>
    </Card>
  );
}