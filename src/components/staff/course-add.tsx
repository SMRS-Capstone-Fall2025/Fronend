import CourseForm, {
  type CourseFormValues,
} from "@/components/staff/course-form";
import { useToast } from "@/hooks/use-toast";
import { useCreateCourseMutation } from "@/services";

type Props = {
  readonly onCancel?: () => void;
};

export default function CourseAddForm({ onCancel }: Props) {
  const { toast } = useToast();
  const createCourse = useCreateCourseMutation({
    onSuccess: (response) => {
      toast({
        title: "Thêm khóa học thành công",
        description: response.message ?? undefined,
        variant: "success",
      });
    },
    onError: (error) => {
      const message =
        (error as any)?.response?.data?.message ??
        (error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      toast({
        title: "Thêm khóa học thất bại",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (values: CourseFormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      imageUrl: values.imageUrl ?? undefined,
      durationDays: values.durationDays ?? undefined,
      price: values.price,
      sections:
        values.sections?.map((section) => ({
          title: section.title,
          description: section.description ?? undefined,
        })) ?? [],
    } as const;

    await createCourse.mutateAsync(payload);
    onCancel?.();
  };

  return (
    <CourseForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitting={createCourse.isPending}
    />
  );
}
