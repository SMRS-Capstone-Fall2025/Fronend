// component for staff to create/edit courses using react-hook-form + zod
import { ImageUpload } from "@/components/upload/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { z } from "zod";

const sectionSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề section"),
  description: z.string().optional(),
});

const courseSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên khóa học"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  imageUrl: z
    .string()
    .url("URL không hợp lệ")
    .or(z.literal(""))
    .or(z.null())
    .transform((value) => value || undefined)
    .optional(),
  durationDays: z.number().int().nonnegative().optional(),
  price: z
    .string()
    .transform((val) => {
      return Number(val.split(",").join(""));
    })
    .refine((val) => !Number.isNaN(val), {
      message: "Giá không hợp lệ",
    }),
  sections: z.array(sectionSchema).optional(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

export interface CourseFormProps {
  readonly defaultValues?: Partial<CourseFormValues>;
  readonly onSubmit: (values: CourseFormValues) => Promise<void> | void;
  readonly onCancel?: () => void;
  readonly submitting?: boolean;
}

export default function CourseForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: CourseFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      imageUrl: defaultValues?.imageUrl,
      durationDays: defaultValues?.durationDays ?? undefined,
      price: defaultValues?.price ?? 0,
      sections: defaultValues?.sections ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-1 gap-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <ImageUpload
                  label="Hình ảnh khóa học"
                  description="Tải hình ảnh đại diện cho khóa học."
                  value={field.value ?? null}
                  onChange={(url) => {
                    field.onChange(url ?? undefined);
                    field.onBlur();
                  }}
                  disabled={submitting || isSubmitting}
                />
              )}
            />
            {errors.imageUrl && (
              <p className="text-destructive text-sm">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Tên khóa học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="price">
              Giá (VND) <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <NumericFormat
                  {...field}
                  allowNegative={false}
                  max={50_000_000}
                  thousandSeparator=","
                  decimalScale={0}
                  customInput={Input}
                  aria-invalid={!!errors.price}
                  onValueChange={(values) => {
                    field.onChange(values.value || "");
                  }}
                  value={field.value}
                />
              )}
            />
            {errors.price && (
              <p className="text-destructive text-sm">{errors.price.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">
              Mô tả <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-destructive text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="durationDays">Số ngày (durationDays)</Label>
            <Input
              id="durationDays"
              type="number"
              step="1"
              {...register("durationDays", { valueAsNumber: true })}
            />
            {errors.durationDays && (
              <p className="text-destructive text-sm">
                {errors.durationDays.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-2">
            <Label>Tài liệu / Sections</Label>
            <div className="space-y-3">
              {fields.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Không có section nào. Thêm section để mô tả nội dung khóa học.
                </div>
              )}
              {fields.map((f, idx) => (
                <div
                  key={f.id}
                  className="flex flex-col gap-2 rounded-md border p-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Section {idx + 1}</div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(idx)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Tiêu đề</Label>
                    <Input {...register(`sections.${idx}.title` as const)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Mô tả</Label>
                    <Textarea
                      {...register(`sections.${idx}.description` as const)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append({ title: "", description: "" })}
              >
                Thêm section
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 md:col-span-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting || isSubmitting}
          >
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={submitting || isSubmitting}>
          {(submitting || isSubmitting) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {submitting || isSubmitting ? "Đang xử lý..." : "Lưu"}
        </Button>
      </div>
    </form>
  );
}
