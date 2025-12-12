import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "@/lib/validations/project";
import { useMajorsQuery } from "@/services/major/hooks";
import { useCreateProjectMutation } from "@/services/project/hooks";
import {
  useUploadFileMutation,
  useUploadImageMutation,
} from "@/services/upload";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FilePlus,
  GraduationCap,
  ImagePlus,
  Loader2,
  Paperclip,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

export interface PreviewItem {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly previewUrl: string;
  readonly file: File;
  readonly fileType: string;
}

interface CreateProjectDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectDialogProps) {
  const { toast } = useToast();
  const [filePreviews, setFilePreviews] = useState<PreviewItem[]>([]);
  const [imagePreviews, setImagePreviews] = useState<PreviewItem[]>([]);
  const { data: majors = [], isLoading: isLoadingMajors } = useMajorsQuery();

  const activeMajors = useMemo(() => {
    return majors
      .filter((major) => major.isActive !== false && major.name)
      .sort((a, b) => {
        const nameA = a.name ?? "";
        const nameB = b.name ?? "";
        return nameA.localeCompare(nameB);
      });
  }, [majors]);

  const createProjectForm = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      dueDate: "",
    },
  });

  const createProjectMutation = useCreateProjectMutation();
  const uploadImageMutation = useUploadImageMutation();
  const uploadFileMutation = useUploadFileMutation();
  const isCreating = createProjectMutation.isPending;
  const isUploadingAttachments =
    uploadImageMutation.isPending || uploadFileMutation.isPending;

  const makeFileKey = (file: File) =>
    `${file.name}-${file.size}-${file.lastModified ?? ""}`;

  const createPreviewItem = (file: File): PreviewItem => ({
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    size: file.size,
    previewUrl: URL.createObjectURL(file),
    file,
    fileType: file.type || "application/octet-stream",
  });

  const clearAttachmentPreviews = () => {
    setFilePreviews((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setImagePreviews((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  };

  const handleImageFiles = (files: File[]) => {
    if (!files.length) return;

    setImagePreviews((prev) => {
      const existing = new Set(prev.map((item) => makeFileKey(item.file)));
      let mutated = false;
      const nextItems = [...prev];

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const key = makeFileKey(file);
        if (existing.has(key)) return;

        existing.add(key);
        mutated = true;
        nextItems.push(createPreviewItem(file));
      });

      return mutated ? nextItems : prev;
    });
  };

  const handleDocumentFiles = (files: File[]) => {
    if (!files.length) return;

    const imageCandidates: File[] = [];
    const documentCandidates: File[] = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        imageCandidates.push(file);
      } else {
        documentCandidates.push(file);
      }
    });

    if (imageCandidates.length) {
      handleImageFiles(imageCandidates);
    }

    if (!documentCandidates.length) return;

    setFilePreviews((prev) => {
      const existing = new Set(prev.map((item) => makeFileKey(item.file)));
      let mutated = false;
      const nextItems = [...prev];

      documentCandidates.forEach((file) => {
        const key = makeFileKey(file);
        if (existing.has(key)) return;

        existing.add(key);
        mutated = true;
        nextItems.push(createPreviewItem(file));
      });

      return mutated ? nextItems : prev;
    });
  };

  const handleDocumentInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    handleDocumentFiles(files);
    event.target.value = "";
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    handleImageFiles(files);
    event.target.value = "";
  };

  const handleDropDocuments = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []);
    handleDocumentFiles(files);
  };

  const handleDropImages = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []);
    handleImageFiles(files);
  };

  const removeFilePreview = (id: string) => {
    setFilePreviews((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const removeImagePreview = (id: string) => {
    setImagePreviews((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const resetCreateProjectForm = () => {
    createProjectForm.reset({
      name: "",
      description: "",
      type: "",
      dueDate: "",
    });
    clearAttachmentPreviews();
  };

  const closeCreateDialog = () => {
    onOpenChange(false);
    resetCreateProjectForm();
  };

  const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const handleCreateProjectSubmit = createProjectForm.handleSubmit(
    async (values) => {
      try {
        const uploadedImages: Array<{ url: string }> = [];
        for (const item of imagePreviews) {
          const response = await uploadImageMutation.mutateAsync({
            file: item.file,
          });
          const data = response.data as
            | string
            | { readonly url?: string | null; readonly path?: string | null }
            | undefined;
          const url =
            typeof data === "string" ? data : data?.url ?? data?.path ?? null;
          if (!url) {
            throw new Error(
              `Không thể tải hình ảnh "${item.name}". Vui lòng thử lại.`
            );
          }
          uploadedImages.push({ url });
        }

        const uploadedFiles: Array<{
          readonly filePath: string;
          readonly type: string;
          readonly fileType?: string;
        }> = [];
        for (const item of filePreviews) {
          const response = await uploadFileMutation.mutateAsync({
            file: item.file,
          });
          const data = response.data as
            | string
            | { readonly path?: string | null; readonly url?: string | null }
            | undefined;
          const path =
            typeof data === "string" ? data : data?.path ?? data?.url ?? null;
          if (!path) {
            throw new Error(
              `Không thể tải tệp "${item.name}". Vui lòng thử lại.`
            );
          }
          uploadedFiles.push({
            filePath: path,
            type: item.fileType,
            fileType: item.fileType,
          });
        }

        await createProjectMutation.mutateAsync({
          name: values.name.trim(),
          description: values.description?.trim()
            ? values.description.trim()
            : undefined,
          type: values.type?.trim() ? values.type.trim() : undefined,
          dueDate: values.dueDate || undefined,
          files: uploadedFiles.length ? uploadedFiles : undefined,
          images: uploadedImages.length ? uploadedImages : undefined,
        });

        toast({
          title: "Đã tạo dự án",
          description: `Dự án "${values.name}" đã được thêm thành công.`,
        });

        closeCreateDialog();
        onSuccess?.();
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Không thể tạo dự án",
          description:
            error instanceof Error ? error.message : "Vui lòng thử lại sau.",
        });
      }
    }
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetCreateProjectForm();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-hidden border border-border/60 bg-background p-0 shadow-2xl flex flex-col">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-b border-blue-600/20 px-6 py-6 text-left sm:px-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          <DialogHeader className="relative items-start text-left">
            <DialogTitle className="text-2xl font-semibold text-white">
              Tạo dự án mới
            </DialogTitle>
            <DialogDescription className="text-sm text-blue-100">
              Điền thông tin chính và đính kèm tài liệu trước khi gửi cho hội
              đồng. Bạn có thể cập nhật sau khi dự án được khởi tạo.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-wider text-blue-100">
            <span>
              Tệp đính kèm: {filePreviews.length + imagePreviews.length}
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-0">
            <Form {...createProjectForm}>
              <form
                id="create-project-form"
                onSubmit={handleCreateProjectSubmit}
                className="space-y-8"
              >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <div className="space-y-4">
                        <FormField
                          control={createProjectForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Chuyên ngành (nếu có)
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(
                                      value === "none" ? "" : value
                                    );
                                  }}
                                  value={field.value || "none"}
                                  disabled={
                                    isCreating ||
                                    isUploadingAttachments ||
                                    isLoadingMajors
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn chuyên ngành" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      Không chọn
                                    </SelectItem>
                                    {activeMajors.map((major) => {
                                      const majorName = major.name ?? "";
                                      if (!majorName) return null;
                                      return (
                                        <SelectItem
                                          key={major.id}
                                          value={majorName}
                                        >
                                          <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            <span>{majorName}</span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createProjectForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Tên dự án{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nhập tên dự án"
                                  disabled={
                                    isCreating || isUploadingAttachments
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createProjectForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Mô tả
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={5}
                                  placeholder="Trình bày mục tiêu, phạm vi và yêu cầu chính của dự án."
                                  disabled={
                                    isCreating || isUploadingAttachments
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createProjectForm.control}
                          name="dueDate"
                          render={({ field }) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Hạn nộp (nếu có)
                                </FormLabel>
                                <FormControl>
                                  <DatePicker
                                    value={field.value}
                                    onChange={(value) =>
                                      field.onChange(value ?? "")
                                    }
                                    onBlur={field.onBlur}
                                    placeholder="Chọn hạn nộp"
                                    disabled={
                                      isCreating || isUploadingAttachments
                                    }
                                    fromDate={today}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">
                        Gợi ý trình bày
                      </p>
                      <ul className="mt-3 space-y-2 text-xs leading-relaxed">
                        <li>• Nêu rõ mục tiêu, phạm vi và lợi ích mong đợi.</li>
                        <li>
                          • Đính kèm ít nhất một tài liệu mô tả chi tiết đề tài.
                        </li>
                        <li>
                          • Hạn nộp giúp hệ thống nhắc nhở các mốc quan trọng.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-border/60 bg-card p-5">
                      <h4 className="text-sm font-semibold text-foreground">
                        Tài liệu đính kèm (PDF, DOCX...)
                      </h4>
                      <label
                        htmlFor="dean-project-documents"
                        className="mt-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-background px-4 text-center text-sm text-muted-foreground transition hover:border-foreground/50"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={handleDropDocuments}
                      >
                        <FilePlus className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-foreground">
                            Kéo thả tài liệu vào đây
                          </p>
                          <p className="text-xs">Hoặc nhấp để chọn từ máy</p>
                        </div>
                        <input
                          id="dean-project-documents"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleDocumentInputChange}
                          disabled={isCreating || isUploadingAttachments}
                        />
                      </label>
                      {filePreviews.length ? (
                        <ScrollArea className="mt-4 max-h-48 rounded-2xl border border-border/60 pr-2">
                          <ul className="divide-y divide-border/60">
                            {filePreviews.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center gap-3 px-4 py-3 text-sm"
                              >
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-foreground">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(item.size)} ·{" "}
                                    {item.fileType || "Không rõ"}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground"
                                  onClick={() => removeFilePreview(item.id)}
                                  disabled={
                                    isCreating || isUploadingAttachments
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Xóa tệp</span>
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Chưa có tài liệu nào được chọn.
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-card p-5">
                      <h4 className="text-sm font-semibold text-foreground">
                        Hình ảnh minh họa
                      </h4>
                      <label
                        htmlFor="dean-project-images"
                        className="mt-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-background px-4 text-center text-sm text-muted-foreground transition hover:border-foreground/50"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={handleDropImages}
                      >
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-foreground">
                            Kéo thả hình ảnh vào đây
                          </p>
                          <p className="text-xs">PNG, JPG, WEBP (≤5MB)</p>
                        </div>
                        <input
                          id="dean-project-images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={handleImageInputChange}
                          disabled={isCreating || isUploadingAttachments}
                        />
                      </label>
                      {imagePreviews.length ? (
                        <ScrollArea className="mt-4 max-h-48 rounded-2xl border border-border/60 pr-2">
                          <div className="grid gap-3 p-3 sm:grid-cols-2">
                            {imagePreviews.map((item) => (
                              <div
                                key={item.id}
                                className="group relative overflow-hidden rounded-2xl border border-border/60"
                              >
                                <img
                                  src={item.previewUrl}
                                  alt={item.name}
                                  className="h-32 w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Chưa có hình ảnh nào được chọn.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-shrink-0 flex flex-col gap-3 border-t border-border/60 bg-background px-6 py-4 sm:px-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Tài liệu được lưu an toàn và có thể cập nhật sau khi dự án được tạo.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={closeCreateDialog}
              disabled={isCreating || isUploadingAttachments}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="create-project-form"
              className="min-w-[160px]"
              disabled={isCreating || isUploadingAttachments}
            >
              {isCreating || isUploadingAttachments ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                "Tạo dự án"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
