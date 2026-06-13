import React from "react";
import { Card } from "@heroui/react";

/**
 * StatCard
 * A clean card for displaying a single metric or statistic.
 *
 * Props:
 *   title   {string} - The title of the metric
 *   value   {string|number} - The main value
 *   subtext {string} - Secondary text or trend
 *   icon    {React.Node} - Optional icon element
 */
export default function StatCard({ title, value, subtext, icon }) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
      <div className="p-4 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[13px] font-semibold text-gray-500 tracking-wide">{title}</h3>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && (
            <p className="text-[13px] font-medium text-gray-500">{subtext}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
