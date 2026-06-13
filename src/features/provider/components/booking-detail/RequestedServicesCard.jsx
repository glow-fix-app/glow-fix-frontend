import React from "react";
import { Card } from "@heroui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function RequestedServicesCard({ items, isPending, editablePrices, handlePriceChange, totalPrice }) {
  return (
    <Card className="p-6 border border-gray-100 bg-white rounded-2xl">
      <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-2.5">
        <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
        <h2 className="text-gray-800 font-semibold text-sm tracking-tight">Requested Services</h2>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/30 rounded-xl border border-gray-100/80 gap-4">
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm tracking-tight">{item.serviceTitle}</p>
              {item.serviceDescription && (
                <p className="text-xs text-gray-500 mt-1 max-w-lg leading-relaxed">{item.serviceDescription}</p>
              )}
            </div>
            
            <div className="w-full sm:w-48 flex items-center justify-end">
              {isPending ? (
                <div className="flex items-center justify-end w-full sm:w-auto">
                  <div className="flex items-center bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all h-9 rounded-md">
                    <span className="text-xs font-medium text-gray-500 select-none mr-2">EGP</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editablePrices[item.businessServiceId] !== undefined ? String(editablePrices[item.businessServiceId]) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val)) {
                          handlePriceChange(item.businessServiceId, val);
                        }
                      }}
                      className="w-20 text-sm text-right outline-none text-gray-700 font-medium bg-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Service Price</p>
                  <p className="font-semibold text-sm text-gray-800 mt-0.5">EGP {parseFloat(item.price).toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isPending && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/20 px-4 py-3 rounded-xl">
          <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Total Agreed Price</span>
          <span className="text-lg font-bold text-gray-800">EGP {parseFloat(totalPrice || 0).toFixed(2)}</span>
        </div>
      )}
    </Card>
  );
}
