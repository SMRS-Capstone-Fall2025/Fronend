import CarForm, { type CarFormValues } from "@/components/staff/car-form";
import { useToast } from "@/hooks/use-toast";
import { useCreateVehicleMutation } from "@/services";

type CarAddFormProps = {
  readonly onCancel?: () => void;
};

export default function CarAddForm({ onCancel }: CarAddFormProps) {
  const { toast } = useToast();
  const createVehicle = useCreateVehicleMutation({
    onSuccess: (response) => {
      toast({
        title: "Thêm xe thành công",
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
        title: "Thêm xe thất bại",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (values: CarFormValues) => {
    await createVehicle.mutateAsync({
      plateNumber: values.plateNumber,
      brand: values.brand,
      model: values.model,
      status: values.status,
    });
  };

  return (
    <CarForm
      mode="create"
      submitting={createVehicle.isPending}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
