import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Card, Spinner, toast } from "@heroui/react";
import { useVehicles, useDeleteVehicle } from "@/features/client/hooks/useVehicles";
import EmptyState from "@/components/feedback/EmptyState";
import VehicleModal from "@/features/client/components/settings/VehicleModal";
import VehicleDeleteModal from "@/features/client/components/settings/VehicleDeleteModal";

export default function ClientVehiclesPage() {
  const { data: vehicles = [], isLoading, error } = useVehicles();
  const deleteMutation = useDeleteVehicle();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  function handleDelete(vehicle) {
    setVehicleToDelete(vehicle);
  }

  function confirmDelete() {
    if (!vehicleToDelete) return;
    deleteMutation.mutate(vehicleToDelete.id, {
      onSuccess: () => {
        toast.success("Vehicle deleted successfully!");
        setVehicleToDelete(null);
      },
      onError: () => {
        toast.danger("Failed to delete vehicle.");
      },
    });
  }

  function handleAdd() {
    setVehicleToEdit(null);
    setIsModalOpen(true);
  }

  function handleEdit(vehicle) {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Garage</p>
          <h1 className="text-xl font-semibold text-text-primary">My vehicles</h1>
        </div>
        <Button
          className="h-10 rounded-xl bg-brand-500 px-6 text-[13px] font-semibold text-white transition-all hover:bg-brand-600"
          startContent={<PlusIcon className="h-4 w-4 stroke-[3]" />}
          onPress={handleAdd}
        >
          Add vehicle
        </Button>
      </header>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading vehicles"
          message="There was an issue fetching your garage. Please try again later."
        />
      ) : (
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <EmptyState
              title="No vehicles found"
              message="You haven't added any vehicles to your garage yet."
            />
          ) : (
            vehicles.map((car) => (
              <Card key={car.id} className="border-none bg-white p-4 shadow-sm ring-1 ring-black/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover ring-1 ring-black/5">
                      <svg className="h-6 w-6 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A2 2 0 002 11.7V16c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-text-primary">{car.year} {car.model}</h3>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{car.color} {car.license_plate ? `· ${car.license_plate}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      isIconOnly 
                      className="h-9 w-9 rounded-xl border border-border-form bg-white text-text-tertiary hover:bg-surface-hover" 
                      variant="bordered"
                      onPress={() => handleEdit(car)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      className="h-9 w-9 rounded-xl border border-border-form bg-white text-text-tertiary hover:bg-surface-hover"
                      variant="bordered"
                      onPress={() => handleDelete(car)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <VehicleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicleToEdit={vehicleToEdit}
      />

      <VehicleDeleteModal
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        vehicle={vehicleToDelete}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
