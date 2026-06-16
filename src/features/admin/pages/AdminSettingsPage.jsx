import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Card, Button, Input, Switch, Spinner } from "@heroui/react";
import { toast } from "@heroui/react";
import { adminApi } from "@/features/admin/services/adminApi";
import { CogIcon, CurrencyDollarIcon, ClockIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin_settings'],
    queryFn: adminApi.settings,
  });

  useEffect(() => {
    if (settings) {
      reset({
        business_fee_pct: settings.business_fee_pct || 10,
        max_cancel_minutes: settings.max_cancel_minutes || 120,
        max_booking_advance_days: settings.max_booking_advance_days || 30,
        min_booking_cancel_hours: settings.min_booking_cancel_hours || 2,
        maintenance_mode: settings.maintenance_mode || false,
        maintenance_message: settings.maintenance_message || "We are currently undergoing maintenance.",
      });
    }
  }, [settings, reset]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => adminApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_settings']);
      toast.success("Settings updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update settings.");
    }
  });

  const onSubmit = (data) => {
    updateSettingsMutation.mutate({
      ...data,
      business_fee_pct: Number(data.business_fee_pct),
      max_cancel_minutes: Number(data.max_cancel_minutes),
      max_booking_advance_days: Number(data.max_booking_advance_days),
      min_booking_cancel_hours: Number(data.min_booking_cancel_hours),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage platform configuration and business rules.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" lang="en" dir="ltr">
        
        {/* Financial Settings */}
        <Card className="p-6 border border-gray-100 shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CurrencyDollarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Financial Settings</h2>
              <p className="text-sm text-gray-500">Configure platform fees and monetization.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="business_fee_pct"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Platform Fee Percentage (%)"
                  placeholder="e.g. 10"
                  variant="bordered"
                  description="The percentage cut taken from each successful booking."
                  endContent={<span className="text-gray-400 text-sm">%</span>}
                />
              )}
            />
          </div>
        </Card>

        {/* Booking Rules */}
        <Card className="p-6 border border-gray-100 shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Booking Rules</h2>
              <p className="text-sm text-gray-500">Set limits and time constraints for bookings.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="max_cancel_minutes"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Max Grace Cancellation (Minutes)"
                  placeholder="e.g. 120"
                  variant="bordered"
                  description="Free cancellation window after a booking is confirmed."
                  endContent={<span className="text-gray-400 text-sm">min</span>}
                />
              )}
            />
            
            <Controller
              name="max_booking_advance_days"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Max Advance Booking (Days)"
                  placeholder="e.g. 30"
                  variant="bordered"
                  description="How far in advance customers can book a service."
                  endContent={<span className="text-gray-400 text-sm">days</span>}
                />
              )}
            />
            
            <Controller
              name="min_booking_cancel_hours"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Min Cancellation Notice (Hours)"
                  placeholder="e.g. 24"
                  variant="bordered"
                  description="Required notice before appointment to avoid penalty."
                  endContent={<span className="text-gray-400 text-sm">hrs</span>}
                />
              )}
            />
          </div>
        </Card>

        {/* System */}
        <Card className="p-6 border border-gray-100 shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Maintenance</h2>
              <p className="text-sm text-gray-500">Control platform access during upgrades.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <Controller
              name="maintenance_mode"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Switch
                  isSelected={value}
                  onValueChange={onChange}
                  color="danger"
                >
                  Enable Maintenance Mode
                </Switch>
              )}
            />

            <Controller
              name="maintenance_message"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Maintenance Message"
                  placeholder="e.g. We are currently undergoing maintenance..."
                  variant="bordered"
                  description="Message displayed to users when maintenance is active."
                  fullWidth
                />
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end pt-4 pb-12">
          <Button 
            type="submit" 
            color="primary" 
            isLoading={updateSettingsMutation.isPending}
            isDisabled={!isDirty}
            className="px-8 font-medium shadow-sm"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
