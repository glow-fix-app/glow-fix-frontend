import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Button, toast, Spinner, Label, Switch, ListBox, Select } from "@heroui/react";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { FormInput } from "@/components/ui/FormInput";
import EmptyState from "@/components/feedback/EmptyState";
import { providerApi } from "@/features/provider/services/providerApi";

export default function ProviderServicesPage() {
  const queryClient = useQueryClient();
  const [isOpenNew, setIsOpenNew] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [chosenServiceId, setChosenServiceId] = useState("");

  // 1. Fetch Manager's Business Details
  const { data: business, isLoading: isBusinessLoading, error: businessError } = useQuery({
    queryKey: ["myBusiness"],
    queryFn: providerApi.myBusiness,
  });

  const businessId = business?.id;

  // 2. Fetch Assigned Services
  const { data: assignedServices = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ["assignedServices", businessId],
    queryFn: () => providerApi.getAssignedServices(businessId),
    enabled: !!businessId,
  });

  // 3. Fetch Unassigned Catalog Services
  const { data: unassignedServices = [], refetch: refetchUnassigned } = useQuery({
    queryKey: ["unassignedServices", businessId],
    queryFn: () => providerApi.getUnassignedServices(businessId),
    enabled: !!businessId && isOpenNew,
  });

  // Form Setup for Assign (New) Service
  const newForm = useForm({
    defaultValues: {
      service_id: "",
      price: "",
      average_duration: "",
    }
  });

  // Form Setup for Edit Service
  const editForm = useForm({
    defaultValues: {
      price: "",
      average_duration: "",
    }
  });

  // Sync selected service state to react-hook-form value
  useEffect(() => {
    newForm.setValue("service_id", chosenServiceId, { shouldValidate: true });
  }, [chosenServiceId, newForm]);

  // Refetch unassigned catalog list when assign modal opens
  useEffect(() => {
    if (isOpenNew && businessId) {
      refetchUnassigned();
      setChosenServiceId("");
      newForm.reset({
        service_id: "",
        price: "",
        average_duration: "",
      });
    }
  }, [isOpenNew, businessId, refetchUnassigned, newForm]);

  // Set default values when edit modal opens
  useEffect(() => {
    if (isOpenEdit && selectedService) {
      editForm.reset({
        price: selectedService.price ? Number(selectedService.price) : "",
        average_duration: selectedService.average_duration ?? "",
      });
    }
  }, [isOpenEdit, selectedService, editForm]);

  // --- MUTATIONS ---

  // Assign Service Mutation
  const assignMutation = useMutation({
    mutationFn: (data) => providerApi.assignService(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignedServices", businessId] });
      toast.success("Service assigned successfully");
      setIsOpenNew(false);
    },
    onError: () => {
      toast.danger("Failed to assign service");
    }
  });

  // Update Service Mutation
  const updateMutation = useMutation({
    mutationFn: ({ businessServiceId, data }) => providerApi.updateAssignedService(businessId, businessServiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignedServices", businessId] });
      toast.success("Service updated successfully");
      setIsOpenEdit(false);
    },
    onError: () => {
      toast.danger("Failed to update service");
    }
  });

  // Toggle Service Active Status Mutation
  const toggleMutation = useMutation({
    mutationFn: (businessServiceId) => providerApi.toggleAssignedService(businessId, businessServiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignedServices", businessId] });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.danger("Failed to toggle status");
    }
  });

  // Delete Service Mutation
  const deleteMutation = useMutation({
    mutationFn: (businessServiceId) => providerApi.deleteAssignedService(businessId, businessServiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignedServices", businessId] });
      toast.success("Service deleted successfully");
      setIsOpenDelete(false);
    },
    onError: () => {
      toast.danger("Failed to delete service");
    }
  });

  // --- SUBMISSIONS ---

  const onAssignSubmit = (data) => {
    if (!chosenServiceId) {
      newForm.setError("service_id", { type: "manual", message: "Please select a service" });
      return;
    }
    assignMutation.mutate({
      service_id: chosenServiceId,
      price: Math.round(Number(data.price)),
      average_duration: Math.round(Number(data.average_duration)),
      is_active: true,
    });
  };

  const onEditSubmit = (data) => {
    updateMutation.mutate({
      businessServiceId: selectedService.id,
      data: {
        price: Math.round(Number(data.price)),
        average_duration: Math.round(Number(data.average_duration)),
      }
    });
  };

  const onDeleteConfirm = () => {
    deleteMutation.mutate(selectedService.id);
  };

  // Loading and Error States
  if (isBusinessLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-500">Loading services page...</p>
      </div>
    );
  }

  if (businessError) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Error Loading Page</h2>
        <p>There was a problem loading your business details. Please refresh the page.</p>
      </div>
    );
  }

  const isPending = assignMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="w-full pb-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage services offered by your workshop</p>
        </div>
        <Button
          color="primary"
          className="rounded-full bg-brand-500 text-white font-medium hover:bg-brand-600 shadow-md shadow-blue-500/10 cursor-pointer w-full sm:w-auto"
          onPress={() => setIsOpenNew(true)}
          startContent={<PlusIcon className="w-4.5 h-4.5" />}
        >
          New Service
        </Button>
      </div>

      {/* Services Grid */}
      {isServicesLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="md" color="primary" />
        </div>
      ) : assignedServices.length === 0 ? (
        <EmptyState
          title="No services assigned"
          message="Assign services from the catalog to start accepting bookings."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignedServices.map((service) => (
            <article
              key={service.id}
              className={`flex flex-col rounded-3xl border p-6 bg-white transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.03] ${
                service.is_active ? "border-gray-200" : "border-gray-200 bg-gray-50/50 opacity-75"
              }`}
            >
              {/* Card Header: Title and @heroui/react Switch */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[17px] font-semibold text-text-primary leading-snug">
                  {service.service_title}
                </h3>
                <Switch
                  isSelected={service.is_active ?? false}
                  onChange={() => toggleMutation.mutate(service.id)}
                  aria-label="Toggle active status"
                >
                  <Switch.Control className="cursor-pointer">
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              </div>

              {/* Description */}
              <p className="mt-2 text-[13px] text-text-tertiary leading-relaxed flex-grow line-clamp-2">
                {service.service_description || "No description provided."}
              </p>

              {/* Price and Duration */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[14px] font-semibold text-text-primary">
                <span>EGP {Number(service.price).toLocaleString("en-EG")}</span>
                <span className="text-gray-300 font-normal">•</span>
                <span className="text-text-tertiary font-medium">{service.average_duration} min</span>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-4 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(service);
                    setIsOpenEdit(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(service);
                    setIsOpenDelete(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* --- MODAL: ASSIGN/NEW SERVICE --- */}
      <Modal isOpen={isOpenNew} onOpenChange={(val) => !val && setIsOpenNew(false)}>
        <Modal.Backdrop variant="opaque">
          <Modal.Container className="flex items-center justify-center p-4">
            <Modal.Dialog className="w-full max-w-lg rounded-[28px] bg-white p-0 shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <form onSubmit={newForm.handleSubmit(onAssignSubmit)}>
                <Modal.Header className="flex flex-row items-center justify-between border-b border-gray-100 px-8 py-6 bg-white">
                  <div>
                    <Modal.Heading className="text-[18px] text-text-primary leading-tight font-bold">
                      Add Service
                    </Modal.Heading>
                    <p className="text-[13px] text-text-tertiary mt-0.5">
                      Assign a service from the system catalog to your business.
                    </p>
                  </div>
                  <button type="button" onClick={() => setIsOpenNew(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Modal.Header>
                <Modal.Body className="p-8 space-y-5">
                  {/* Select Service Dropdown via @heroui/react Select & ListBox */}
                  <div className="w-full space-y-2">
                    <Select 
                      className="w-full" 
                      placeholder="Choose a service..."
                      selectedKey={chosenServiceId || ""}
                      onSelectionChange={(key) => {
                        let selected = key;
                        if (typeof selected === 'string') {
                          selected = selected.replace(/^\$\.?|^\.\$/g, '');
                        }
                        setChosenServiceId(selected);
                      }}
                    >
                      <Label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Select Service</Label>
                      <Select.Trigger className="h-12 w-full rounded-xl border border-gray-300 px-6 text-[14px] font-normal transition-all outline-none bg-white text-text-primary focus:border-brand-500 flex items-center justify-between cursor-pointer">
                        <Select.Value />
                        <Select.Indicator>▼</Select.Indicator>
                      </Select.Trigger>
                      <Select.Popover className="bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-[9999] w-[calc(100vw-4rem)] max-w-[448px]">
                        <ListBox className="max-h-60 overflow-y-auto">
                          {unassignedServices.map((s) => (
                            <ListBox.Item 
                              key={s.id} 
                              id={s.id} 
                              textValue={s.title}
                              className="px-4 py-2 text-[14px] hover:bg-brand-500/10 rounded-lg cursor-pointer flex items-center justify-between"
                            >
                              {s.title} ({s.category_name})
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    {newForm.formState.errors.service_id && (
                      <p className="px-1 text-[10px] font-bold text-red-500">{newForm.formState.errors.service_id.message}</p>
                    )}
                  </div>

                  <FormInput
                    label="Price (EGP)"
                    type="number"
                    lang="en"
                    {...newForm.register("price", {
                      required: "Price is required",
                      min: { value: 0, message: "Price must be positive" },
                      valueAsNumber: true,
                    })}
                    error={newForm.formState.errors.price?.message}
                  />

                  <FormInput
                    label="Duration (minutes)"
                    type="number"
                    lang="en"
                    {...newForm.register("average_duration", {
                      required: "Duration is required",
                      min: { value: 1, message: "Duration must be at least 1 minute" },
                      valueAsNumber: true,
                    })}
                    error={newForm.formState.errors.average_duration?.message}
                  />
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-5">
                  <Button type="button" variant="flat" onPress={() => setIsOpenNew(false)} className="rounded-full h-11 px-6 text-[15px] bg-gray-100 text-gray-700 hover:bg-gray-200" isDisabled={isPending}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    className="rounded-full bg-brand-500 text-white h-11 px-8 text-[15px] shadow-md shadow-blue-500/20 hover:bg-brand-600 cursor-pointer"
                    isLoading={isPending}
                  >
                    Add Service
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* --- MODAL: EDIT SERVICE --- */}
      <Modal isOpen={isOpenEdit} onOpenChange={(val) => !val && setIsOpenEdit(false)}>
        <Modal.Backdrop variant="opaque">
          <Modal.Container className="flex items-center justify-center p-4">
            <Modal.Dialog className="w-full max-w-lg rounded-[28px] bg-white p-0 shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
                <Modal.Header className="flex flex-row items-center justify-between border-b border-gray-100 px-8 py-6 bg-white">
                  <div>
                    <Modal.Heading className="text-[18px] text-text-primary leading-tight font-bold">
                      Edit Service
                    </Modal.Heading>
                    <p className="text-[13px] text-text-tertiary mt-0.5">
                      Update price and duration for {selectedService?.service_title}.
                    </p>
                  </div>
                  <button type="button" onClick={() => setIsOpenEdit(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Modal.Header>
                <Modal.Body className="p-8 space-y-5">
                  <FormInput
                    label="Price (EGP)"
                    type="number"
                    lang="en"
                    {...editForm.register("price", {
                      required: "Price is required",
                      min: { value: 0, message: "Price must be positive" },
                      valueAsNumber: true,
                    })}
                    error={editForm.formState.errors.price?.message}
                  />

                  <FormInput
                    label="Duration (minutes)"
                    type="number"
                    lang="en"
                    {...editForm.register("average_duration", {
                      required: "Duration is required",
                      min: { value: 1, message: "Duration must be at least 1 minute" },
                      valueAsNumber: true,
                    })}
                    error={editForm.formState.errors.average_duration?.message}
                  />
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-5">
                  <Button type="button" variant="flat" onPress={() => setIsOpenEdit(false)} className="rounded-full h-11 px-6 text-[15px] bg-gray-100 text-gray-700 hover:bg-gray-200" isDisabled={isPending}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    className="rounded-full bg-brand-500 text-white h-11 px-8 text-[15px] shadow-md shadow-blue-500/20 hover:bg-brand-600 cursor-pointer"
                    isLoading={isPending}
                  >
                    Save Changes
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* --- MODAL: DELETE SERVICE CONFIRMATION --- */}
      <Modal isOpen={isOpenDelete} onOpenChange={(val) => !val && setIsOpenDelete(false)}>
        <Modal.Backdrop variant="opaque">
          <Modal.Container className="flex items-center justify-center p-4">
            <Modal.Dialog className="w-full max-w-md rounded-[28px] bg-white p-0 shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <Modal.Header className="flex flex-row items-start gap-4 px-8 py-6 bg-white border-b border-gray-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <Modal.Heading className="text-[17px] font-bold text-text-primary">
                    Remove Service
                  </Modal.Heading>
                  <p className="mt-2 text-[13px] text-text-tertiary leading-normal">
                    Are you sure you want to remove <strong>{selectedService?.service_title}</strong>? Customers will no longer be able to book this service from your business.
                  </p>
                </div>
              </Modal.Header>
              <Modal.Footer className="flex items-center justify-end gap-3 bg-gray-50 px-8 py-4">
                <Button type="button" variant="flat" onPress={() => setIsOpenDelete(false)} className="rounded-full h-10 px-5 text-[14px] bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-800" isDisabled={isPending}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onPress={onDeleteConfirm}
                  className="rounded-full bg-red-600 text-white h-10 px-6 text-[14px] font-semibold hover:bg-red-700 cursor-pointer"
                  isLoading={isPending}
                >
                  Remove
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
