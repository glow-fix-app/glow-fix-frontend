import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProviderDashboard } from "../../hooks/useProviderDashboard";
import { providerApi } from "../../services/providerApi";
import { Link } from "react-router-dom";
import { Button, Card, Spinner, toast } from "@heroui/react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/FormInput";

export default function BankDetailsTab() {
  const { business, isLoading, error } = useProviderDashboard();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      bank_name: "",
      bank_account_name: "",
      bank_account_number: "",
      swift_iban: "",
    },
  });

  useEffect(() => {
    if (business) {
      reset({
        bank_name: business.bank_name || "",
        bank_account_name: business.bank_account_name || "",
        bank_account_number: business.bank_account_number || "",
        swift_iban: business.swift_iban || "",
      });
    }
  }, [business, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => providerApi.updateBusiness(data),
    onSuccess: () => {
      toast.success("Bank Details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["provider", "myBusiness"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to update settings.";
      toast.danger(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>There was a problem loading your settings.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <Card className="border-none p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white">
        <h2 className="text-[18px] font-bold text-text-primary mb-1">Bank Account Details</h2>
        <p className="text-[13px] text-text-secondary mb-6">
          Enter your bank information securely. This will be used by the platform administrators to wire your payout funds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Bank Name"
            {...register("bank_name", { required: "Bank name is required" })}
            error={errors.bank_name?.message}
            placeholder="e.g. CIB Bank"
          />

          <FormInput
            label="Account Holder Name"
            {...register("bank_account_name", { required: "Account holder name is required" })}
            error={errors.bank_account_name?.message}
            placeholder="John Doe"
          />

          <FormInput
            label="Account Number"
            {...register("bank_account_number", { 
              required: "Account number is required",
              pattern: {
                value: /^\d+$/,
                message: "Account number must contain only numbers"
              }
            })}
            error={errors.bank_account_number?.message}
            placeholder="1234567890"
          />

          <FormInput
            label="SWIFT / IBAN"
            {...register("swift_iban", { required: "SWIFT / IBAN is required" })}
            error={errors.swift_iban?.message}
            placeholder="SWIFT code or IBAN"
          />
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-[12px] text-text-muted">
          {isDirty ? "You have unsaved changes." : "All changes are saved."}
        </p>
        <Button
          type="submit"
          isDisabled={!isDirty}
          className="h-9 rounded-lg bg-brand-500 px-6 text-[12px] font-semibold text-white transition-all hover:bg-brand-600 disabled:opacity-40"
          isLoading={updateMutation.isPending}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
