import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VehicleDto, VehicleStatus } from "@/services/types";
import { VEHICLE_STATUSES } from "@/services/types";

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  Active: "Đang hoạt động",
  Inactive: "Ngưng hoạt động",
  Maintenance: "Bảo trì",
};

const vehicleFormSchema = z.object({
  plateNumber: z
    .string()
    .min(1, "Biển số không được để trống")
    .max(50, "Biển số quá dài"),
  brand: z
    .string()
    .min(1, "Hãng xe không được để trống")
    .max(100, "Hãng xe quá dài"),
  model: z
    .string()
    .min(1, "Mẫu xe không được để trống")
    .max(100, "Mẫu xe quá dài"),
  status: z.enum(VEHICLE_STATUSES, {
    required_error: "Vui lòng chọn trạng thái",
  }),
});

export type CarFormValues = z.infer<typeof vehicleFormSchema>;

type CarFormProps = {
  readonly mode: "create" | "update";
  readonly vehicle?: VehicleDto | null;
  readonly submitting?: boolean;
  readonly onSubmit: (values: CarFormValues) => void | Promise<void>;
  readonly onCancel?: () => void;
};

export default function CarForm({
  mode,
  vehicle,
  submitting,
  onSubmit,
  onCancel,
}: CarFormProps) {
  const form = useForm<CarFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      plateNumber: vehicle?.plateNumber ?? "",
      brand: vehicle?.brand ?? "",
      model: vehicle?.model ?? "",
      status: vehicle?.status ?? VEHICLE_STATUSES[0],
    },
  });

  useEffect(() => {
    form.reset({
      plateNumber: vehicle?.plateNumber ?? "",
      brand: vehicle?.brand ?? "",
      model: vehicle?.model ?? "",
      status: vehicle?.status ?? VEHICLE_STATUSES[0],
    });
  }, [vehicle, form]);

  const title = mode === "create" ? "Thêm xe mới" : "Cập nhật thông tin xe";

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biển số</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: 30A-123.45"
                      disabled={mode === "update"}
                    />
                  </FormControl>
                  {mode === "update" && (
                    <p className="text-xs text-muted-foreground">
                      Biển số không thể thay đổi.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VEHICLE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {vehicleStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hãng xe</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="VD: Toyota" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mẫu xe</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="VD: Corolla" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="submit" disabled={submitting}>
              {mode === "create" ? "Thêm xe" : "Lưu thay đổi"}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Hủy
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
