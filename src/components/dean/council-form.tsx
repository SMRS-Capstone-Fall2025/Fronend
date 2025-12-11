import { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, X } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMajorsQuery } from "@/services/major/hooks";
import {
  councilFormSchema,
  type CouncilFormValues,
} from "@/lib/validations/council";

export interface CouncilFormProps {
  readonly mode: "create" | "edit";
  readonly initialValues?: Partial<CouncilFormValues>;
  readonly submitting?: boolean;
  readonly onSubmit: (values: CouncilFormValues) => Promise<void> | void;
  readonly onCancel: () => void;
  readonly onDelete?: () => void;
}

export function CouncilForm({
  mode,
  initialValues,
  submitting,
  onSubmit,
  onCancel,
  onDelete,
}: CouncilFormProps) {
  const { data: majors = [], isLoading: isLoadingMajors } = useMajorsQuery();

  const form = useForm<CouncilFormValues>({
    resolver: zodResolver(councilFormSchema),
    defaultValues: {
      councilCode: initialValues?.councilCode ?? "",
      councilName: initialValues?.councilName ?? "",
      department: initialValues?.department ?? "",
      description: initialValues?.description ?? "",
      lecturerEmails: initialValues?.lecturerEmails ?? [],
    },
  });

  const [emailInput, setEmailInput] = useState("");

  const activeMajors = useMemo(() => {
    return majors
      .filter((major) => major.isActive !== false && major.name)
      .sort((a, b) => {
        const nameA = a.name ?? "";
        const nameB = b.name ?? "";
        return nameA.localeCompare(nameB);
      });
  }, [majors]);

  const emails = form.watch("lecturerEmails");

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;

    const emailValidation = z.string().email().safeParse(trimmed);
    if (!emailValidation.success) {
      form.setError("lecturerEmails", {
        type: "manual",
        message: "Email không hợp lệ",
      });
      return;
    }

    if (emails.includes(trimmed)) {
      form.setError("lecturerEmails", {
        type: "manual",
        message: "Giảng viên đã được thêm vào danh sách",
      });
      return;
    }

    if (emails.length >= 5) {
      form.setError("lecturerEmails", {
        type: "manual",
        message: "Tối đa 5 giảng viên cho một hội đồng",
      });
      return;
    }

    const next = [...emails, trimmed];
    form.setValue("lecturerEmails", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.clearErrors("lecturerEmails");
    setEmailInput("");
  };

  const removeEmail = (value: string) => {
    const next = emails.filter((item) => item !== value);
    form.setValue("lecturerEmails", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.clearErrors("lecturerEmails");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addEmail();
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      department: values.department?.trim() || "",
      description: values.description?.trim() || "",
      lecturerEmails: values.lecturerEmails.map((email) => email.trim()),
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="councilCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã hội đồng</FormLabel>
                <FormControl>
                  <Input placeholder="VD: HD-CNTT-01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="councilName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên hội đồng</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Hội đồng nghiệm thu Capstone"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khoa / Bộ môn</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "none" ? "" : value);
                  }}
                  value={field.value || "none"}
                  disabled={isLoadingMajors || submitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khoa / bộ môn" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Không chọn</SelectItem>
                    {activeMajors.map((major) => {
                      const majorName = major.name ?? "";
                      if (!majorName) return null;
                      return (
                        <SelectItem key={major.id} value={majorName}>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span>{majorName}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lecturerEmails"
            render={() => (
              <FormItem>
                <FormLabel>Giảng viên</FormLabel>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập email giảng viên và nhấn Enter"
                  />
                  <Button type="button" variant="secondary" onClick={addEmail}>
                    Thêm
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tối đa 5 giảng viên. Các email phải trùng khớp với tài khoản
                  đã được import.
                </p>
                {emails.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {emails.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {email}
                        <button
                          type="button"
                          className="rounded-full p-0.5 text-muted-foreground transition hover:text-destructive"
                          onClick={() => removeEmail(email)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Ghi chú về phạm vi, tiêu chí đánh giá hoặc lịch làm việc của hội đồng"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {mode === "edit" && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={onDelete}
              disabled={submitting}
            >
              Xóa hội đồng
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              Thêm giảng viên theo email để hệ thống tự ghép vào hội đồng.
            </span>
          )}

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onCancel}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              {mode === "create" ? "Tạo hội đồng" : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
