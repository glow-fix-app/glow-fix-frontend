import React from "react";
import { Card } from "@heroui/react";

export default function PaymentCard({ totalPrice, payment }) {
  const paymentAmount = payment ? payment.amount : totalPrice;
  const paymentStatus = payment ? payment.status : "UNPAID";
  const isPaid = paymentStatus === "PAID";

  return (
    <Card className="p-6 border border-gray-100 bg-white hover:border-gray-200/80 hover:shadow-md transition-all duration-300 rounded-2xl">
      <h3 className="text-gray-800 font-semibold text-sm mb-4 tracking-tight border-b border-gray-50 pb-2">Payment</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Amount</p>
          <p className="font-semibold text-gray-800 mt-1">EGP {parseFloat(paymentAmount || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Status</p>
          <p className="font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
            {isPaid ? "Paid" : "Pending"}
          </p>
        </div>
      </div>
    </Card>
  );
}
