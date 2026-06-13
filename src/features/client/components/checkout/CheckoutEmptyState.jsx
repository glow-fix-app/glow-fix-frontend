import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";

export default function CheckoutEmptyState({
  message,
  actionLabel = "Browse providers",
  actionPath = ROUTE_PATHS.SERVICES,
}) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-[14px] text-text-tertiary">{message}</p>
      <Button
        className="mt-4 h-10 rounded-full bg-brand-500 px-5 text-[13px] font-semibold text-white"
        onPress={() => navigate(actionPath)}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
