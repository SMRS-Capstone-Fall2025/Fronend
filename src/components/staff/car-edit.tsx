import CarForm, { type CarFormValues } from "@/components/staff/car-form";
import { useToast } from "@/hooks/use-toast";
import { useUpdateVehicleMutation } from "@/services";
import type { VehicleDto } from "@/services/types";

type CarEditFormProps = {
  readonly vehicle: VehicleDto;
  readonly onCancel?: () => void;
};

export default function CarEditForm({ vehicle, onCancel }: CarEditFormProps) {
  const { toast } = useToast();
  const updateVehicle = useUpdateVehicleMutation({
    onSuccess: (response) => {
      toast({
        title: "Cập nhật xe thành công",
        description: response.message ?? undefined,
        variant: "success",
      });
      onCancel?.();
    },
    onError: (error) => {
      const message =
        (error as any)?.response?.data?.message ??
        (error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      toast({
        title: "Cập nhật xe thất bại",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (values: CarFormValues) => {
    await updateVehicle.mutateAsync({
      id: vehicle.id,
      brand: values.brand,
      model: values.model,
      status: values.status,
    });
  };

  return (
    <CarForm
      mode="update"
      vehicle={vehicle}
      submitting={updateVehicle.isPending}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
