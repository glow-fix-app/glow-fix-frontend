import { useEffect } from "react";
import { Modal, Button, toast } from "@heroui/react";
import { TruckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FormInput } from "@/components/ui/FormInput";
import { useForm } from "react-hook-form";
import { useAddVehicle, useUpdateVehicle } from "@/features/client/hooks/useVehicles";
import { useSelector } from "react-redux";

export default function VehicleModal({ isOpen, onClose, vehicleToEdit = null }) {
  const user = useSelector((state) => state.auth.user);
  const addMutation = useAddVehicle();
  const updateMutation = useUpdateVehicle();
  const isEditing = !!vehicleToEdit;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      model: "",
      year: "",
      color: "",
      license_plate: ""
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        reset({
          model: vehicleToEdit.model || "",
          year: vehicleToEdit.year || "",
          color: vehicleToEdit.color || "",
          license_plate: vehicleToEdit.license_plate || ""
        });
      } else {
        reset({
          model: "",
          year: "",
          color: "",
          license_plate: ""
        });
      }
    }
  }, [isOpen, vehicleToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: vehicleToEdit.id, data });
        toast.success("Vehicle updated successfully");
      } else {
        await addMutation.mutateAsync({
          ...data,
          client_id: user?.clientProfile?.id || null
        });
        toast.success("Vehicle added successfully");
      }
      onClose();
    } catch (error) {
      toast.danger("Failed to save vehicle");
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Modal isOpen={isOpen} onOpenChange={(val) => !val && onClose()}>
      <Modal.Backdrop variant="opaque">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="w-full max-w-lg rounded-[28px] bg-white p-0 shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="flex flex-row items-center justify-between border-b border-gray-100 px-8 py-6 bg-white">
                <div>
                  <Modal.Heading className="text-[18px] text-text-primary leading-tight">
                    {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
                  </Modal.Heading>
                  <p className="text-[13px] text-text-tertiary mt-0.5">
                    {isEditing ? "Update your vehicle details below." : "Enter your vehicle details to register it."}
                  </p>
                </div>
                <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </Modal.Header>
              <Modal.Body className="p-8 space-y-5">
                <FormInput
                  label="Model"
                  {...register("model", { required: "Model is required" })}
                  error={errors.model?.message}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Year"
                    type="text"
                    inputMode="numeric"
                    {...register("year", {
                      required: "Year is required",
                      valueAsNumber: true,
                      min: { value: 1900, message: "Invalid year" },
                      max: { value: new Date().getFullYear() + 1, message: "Invalid year" }
                    })}
                    error={errors.year?.message}
                  />
                  <FormInput
                    label="Color"
                    {...register("color", { required: "Color is required" })}
                    error={errors.color?.message}
                  />
                </div>
                <FormInput
                  label="License Plate (Optional)"
                  {...register("license_plate", {
                    pattern: {
                      value: /^[a-zA-Z0-9\s\u0600-\u06FF]*$/,
                      message: "License plate can only contain letters, numbers, and spaces"
                    }
                  })}
                  error={errors.license_plate?.message}
                />
              </Modal.Body>
              <Modal.Footer className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-5">
                <Button type="button" variant="flat" onPress={onClose} className="rounded-full h-11 px-6 text-[15px] bg-gray-100 text-gray-700 hover:bg-gray-200" isDisabled={isPending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="rounded-full bg-brand-500 text-white h-11 px-8 text-[15px] shadow-md shadow-blue-500/20 hover:bg-brand-600"
                  isLoading={isPending}
                >
                  {isEditing ? "Save Changes" : "Add Vehicle"}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
