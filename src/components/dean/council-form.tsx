import { Badge } from "@/components/ui/badge";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthAccountStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import {
  councilFormSchema,
  type CouncilFormValues,
} from "@/lib/validations/council";
import {
  useLecturersByMajorQuery,
  useMajorsQuery,
} from "@/services/major/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Briefcase,
  Code,
  GraduationCap,
  JapaneseYen,
  Languages,
  LineChart,
  Megaphone,
  Palette,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export interface CouncilFormProps {
  readonly mode: "create" | "edit";
  readonly initialValues?: Partial<CouncilFormValues>;
  readonly submitting?: boolean;
  readonly onSubmit: (values: CouncilFormValues) => Promise<void> | void;
}

export function CouncilForm({
  mode,
  initialValues,
  submitting,
  onSubmit,
}: CouncilFormProps) {
  const { data: majors = [], isLoading: isLoadingMajors } = useMajorsQuery();
  const account = useAuthAccountStore((state) => state.account);
  const isDean = account?.role === "DEAN" || account?.role === "dean";
  const deanMajor = account?.major;

  const form = useForm<CouncilFormValues>({
    resolver: zodResolver(councilFormSchema),
    defaultValues: {
      councilCode: initialValues?.councilCode ?? "",
      councilName: initialValues?.councilName ?? "",
      department:
        initialValues?.department ??
        (mode === "create" && isDean && deanMajor?.name ? deanMajor.name : ""),
      description: initialValues?.description ?? "",
      lecturerEmails: initialValues?.lecturerEmails ?? [],
    },
  });

  useEffect(() => {
    if (
      mode === "create" &&
      isDean &&
      deanMajor?.name &&
      !initialValues?.department
    ) {
      form.setValue("department", deanMajor.name);
    }
  }, [mode, isDean, deanMajor?.name, initialValues?.department, form]);

  const [lecturerSearchOpen, setLecturerSearchOpen] = useState(false);
  const [lecturerSearchTerm, setLecturerSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(lecturerSearchTerm, 300);

  const activeMajors = useMemo(() => {
    return majors
      .filter((major) => major.isActive !== false && major.name)
      .sort((a, b) => {
        const nameA = a.name ?? "";
        const nameB = b.name ?? "";
        return nameA.localeCompare(nameB);
      });
  }, [majors]);

  const majorIconMap = useMemo(() => {
    const map = new Map<string, LucideIcon>();
    // Map by name
    const iconMappingByName: Record<string, LucideIcon> = {
      "An toàn thông tin": ShieldCheck,
      "Công nghệ thông tin": Code,
      "Khoa học dữ liệu": LineChart,
      "Kỹ thuật phần mềm": Code,
      Marketing: Megaphone,
      "Ngôn ngữ Anh": Languages,
      "Ngôn ngữ Nhật": JapaneseYen,
      "Quản trị kinh doanh": Briefcase,
      "Thiết kế đồ họa": Palette,
      "Trí tuệ nhân tạo": Brain,
    };
    // Map by code (fallback)
    const iconMappingByCode: Record<string, LucideIcon> = {
      IA: ShieldCheck,
      IT: Code,
      DS: LineChart,
      SE: Code,
      MKT: Megaphone,
      EN: Languages,
      JP: JapaneseYen,
      BA: Briefcase,
      GD: Palette,
      AI: Brain,
    };

    activeMajors.forEach((major) => {
      const name = major.name ?? "";
      const code = major.code?.trim().toUpperCase() ?? "";
      if (name) {
        const icon =
          iconMappingByName[name] ||
          (code && iconMappingByCode[code]) ||
          GraduationCap;
        map.set(name, icon);
      }
    });

    return map;
  }, [activeMajors]);

  const departmentValue = form.watch("department");
  const prevDepartmentRef = useRef<string | undefined>(undefined);

  const selectedMajor = useMemo(() => {
    if (!departmentValue) return null;
    return activeMajors.find((major) => major.name === departmentValue) ?? null;
  }, [departmentValue, activeMajors]);

  // Clear lecturer emails when department changes
  useEffect(() => {
    const prevDepartment = prevDepartmentRef.current;
    // Only clear if department actually changed (not on initial mount)
    if (prevDepartment !== undefined && prevDepartment !== departmentValue) {
      form.setValue("lecturerEmails", [], {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.clearErrors("lecturerEmails");
    }
    prevDepartmentRef.current = departmentValue;
  }, [departmentValue, form]);

  const { data: lecturers = [], isLoading: isLoadingLecturers } =
    useLecturersByMajorQuery(selectedMajor?.id ?? 0, {
      enabled: selectedMajor?.id != null,
    });

  const filteredLecturers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return lecturers;
    const searchLower = debouncedSearchTerm.trim().toLowerCase();
    return lecturers.filter(
      (lecturer) =>
        lecturer.name?.toLowerCase().includes(searchLower) ||
        lecturer.email?.toLowerCase().includes(searchLower)
    );
  }, [lecturers, debouncedSearchTerm]);

  const emails = form.watch("lecturerEmails");

  const addLecturer = (lecturerEmail: string) => {
    if (!lecturerEmail) return;

    const trimmed = lecturerEmail.trim().toLowerCase();
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
    setLecturerSearchOpen(false);
    setLecturerSearchTerm("");
  };

  const removeEmail = (value: string) => {
    const next = emails.filter((item) => item !== value);
    form.setValue("lecturerEmails", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.clearErrors("lecturerEmails");
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
      <form id="council-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="councilCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mã hội đồng <span className="text-red-500">*</span>
                </FormLabel>
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
                <FormLabel>
                  Tên hội đồng <span className="text-red-500">*</span>
                </FormLabel>
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
                <FormLabel>
                  Khoa / Bộ môn <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={
                    isLoadingMajors ||
                    submitting ||
                    (mode === "create" && isDean)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <SelectValue placeholder="Chọn khoa / bộ môn" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeMajors.map((major) => {
                      const majorName = major.name ?? "";
                      if (!majorName) return null;
                      const MajorIcon =
                        majorIconMap.get(majorName) || GraduationCap;
                      return (
                        <SelectItem key={major.id} value={majorName}>
                          <div className="flex items-center gap-2">
                            <MajorIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{majorName}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {mode === "create" && isDean && (
                  <p className="text-xs text-muted-foreground">
                    Khoa / Bộ môn được tự động điền từ thông tin của bạn
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lecturerEmails"
            render={() => (
              <FormItem>
                <FormLabel>
                  Giảng viên <span className="text-red-500">*</span>
                </FormLabel>
                <div className="mt-2">
                  <Popover
                    open={lecturerSearchOpen}
                    onOpenChange={(open) => {
                      setLecturerSearchOpen(open);
                      if (!open) {
                        setLecturerSearchTerm("");
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        disabled={
                          !selectedMajor?.id || isLoadingLecturers || submitting
                        }
                      >
                        <Search className="mr-2 h-4 w-4" />
                        {selectedMajor?.id
                          ? "Tìm và chọn giảng viên"
                          : "Chọn khoa/bộ môn trước"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <div className="p-3 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Tìm theo tên hoặc email..."
                            value={lecturerSearchTerm}
                            onChange={(e) =>
                              setLecturerSearchTerm(e.target.value)
                            }
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[300px]">
                        {isLoadingLecturers ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Đang tải danh sách giảng viên...
                          </div>
                        ) : filteredLecturers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {lecturerSearchTerm.trim()
                              ? "Không tìm thấy giảng viên"
                              : "Chưa có giảng viên nào"}
                          </div>
                        ) : (
                          <div className="p-1">
                            {filteredLecturers.map((lecturer) => {
                              const lecturerEmail =
                                lecturer.email?.toLowerCase() ?? "";
                              const isSelected = emails.includes(lecturerEmail);
                              return (
                                <button
                                  key={lecturer.id}
                                  type="button"
                                  onClick={() => {
                                    if (lecturerEmail && !isSelected) {
                                      addLecturer(lecturerEmail);
                                    }
                                  }}
                                  disabled={isSelected || !lecturerEmail}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors",
                                    isSelected
                                      ? "bg-muted cursor-not-allowed opacity-50"
                                      : "hover:bg-accent cursor-pointer",
                                    !lecturerEmail &&
                                      "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">
                                      {lecturer.name ?? "—"}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {lecturer.email ?? "—"}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Đã chọn
                                    </Badge>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tối đa 5 giảng viên. Chọn giảng viên từ danh sách của khoa/bộ
                  môn.
                </p>
                {emails.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {emails.map((email) => {
                      const lecturer = lecturers.find(
                        (l) => l.email?.toLowerCase() === email
                      );
                      return (
                        <Badge
                          key={email}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {lecturer?.name ?? email}
                          <button
                            type="button"
                            className="rounded-full p-0.5 text-muted-foreground transition hover:text-destructive"
                            onClick={() => removeEmail(email)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
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
              <FormLabel>
                Mô tả <span className="text-red-500">*</span>
              </FormLabel>
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
      </form>
    </Form>
  );
}
