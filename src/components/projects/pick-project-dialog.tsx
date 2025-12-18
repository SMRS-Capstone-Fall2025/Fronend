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
import { getErrorMessage } from "@/lib/utils";
import { useMajorsQuery } from "@/services/major/hooks";
import type { PickProjectRequest } from "@/services/types/project";
import {
  useUploadFileMutation,
  useUploadImageMutation,
} from "@/services/upload";
import { FileIcon, ImagePlus, Loader2, UploadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PreviewItem = {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  file: File;
  fileType: string;
};

interface PickProjectDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly projectName: string;
  readonly projectDescription?: string | null;
  readonly projectType?: string | null;
  readonly projectMajorId?: number | null;
  readonly projectDueDate?: string | null;
  readonly onSubmit: (data: PickProjectRequest) => Promise<void>;
  readonly isSubmitting?: boolean;
}

export function PickProjectDialog({
  open,
  onOpenChange,
  projectName,
  projectDescription,
  projectType,
  projectMajorId,
  projectDueDate,
  onSubmit,
  isSubmitting = false,
}: PickProjectDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [majorId, setMajorId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
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

  const uploadImageMutation = useUploadImageMutation();
  const uploadFileMutation = useUploadFileMutation();
  const isUploading =
    uploadImageMutation.isPending || uploadFileMutation.isPending;

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
      }),
    []
  );

  const hasExistingMajor = Boolean(projectType || projectMajorId);

  useEffect(() => {
    if (projectMajorId) {
      setMajorId(projectMajorId);
      if (!projectType && majors.length > 0) {
        const foundMajor = majors.find((major) => major.id === projectMajorId);
        if (foundMajor?.name) {
          setType(foundMajor.name);
        }
      }
    } else if (projectType && majors.length > 0) {
      const foundMajor = majors.find(
        (major) => major.name?.toLowerCase() === projectType.toLowerCase()
      );
      if (foundMajor?.id != null) {
        setMajorId(foundMajor.id);
      }
    } else {
      setMajorId(null);
    }
  }, [projectMajorId, projectType, majors]);

  useEffect(() => {
    if (open) {
      setName(projectName || "");
      setDescription(projectDescription || "");
      // Set type từ projectType, hoặc tìm từ projectMajorId nếu có
      if (projectType) {
        setType(projectType);
      } else if (projectMajorId && majors.length > 0) {
        const foundMajor = majors.find((major) => major.id === projectMajorId);
        if (foundMajor?.name) {
          setType(foundMajor.name);
        } else {
          setType("");
        }
      } else {
        setType("");
      }
      setDueDate(projectDueDate || "");
      setFilePreviews([]);
      setImagePreviews([]);
    }
  }, [
    open,
    projectName,
    projectDescription,
    projectType,
    projectDueDate,
    projectMajorId,
    majors,
  ]);

  useEffect(() => {
    return () => {
      filePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [filePreviews, imagePreviews]);

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên dự án.",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mô tả dự án.",
      });
      return;
    }

    try {
      const uploadedImages: Array<{ url: string }> = [];

      for (const item of imagePreviews) {
        const response = await uploadImageMutation.mutateAsync({
          file: item.file,
        });
        const uploadedData = response.data;
        const uploadedUrl =
          typeof uploadedData === "string"
            ? uploadedData
            : uploadedData?.url ?? uploadedData?.path ?? null;

        if (!uploadedUrl) {
          throw new Error(
            `Không thể tải hình ảnh "${item.name}". Vui lòng thử lại.`
          );
        }

        uploadedImages.push({ url: uploadedUrl });
      }

      const uploadedFiles: Array<{
        filePath: string;
        type: string | null;
      }> = [];

      for (const item of filePreviews) {
        const response = await uploadFileMutation.mutateAsync({
          file: item.file,
        });
        const uploadedData = response.data;
        const uploadedPath =
          typeof uploadedData === "string"
            ? uploadedData
            : uploadedData?.path ?? uploadedData?.url ?? null;

        if (!uploadedPath) {
          throw new Error(
            `Không thể tải tệp "${item.name}". Vui lòng thử lại.`
          );
        }

        uploadedFiles.push({
          filePath: uploadedPath,
          type: item.fileType,
        });
      }

      await onSubmit({
        description: description.trim() || null,
        majorId: majorId ?? null,
        files: uploadedFiles.length > 0 ? uploadedFiles : null,
        images: uploadedImages.length > 0 ? uploadedImages : null,
      });

      setName("");
      setDescription("");
      setType("");
      setDueDate("");
      setFilePreviews([]);
      setImagePreviews([]);
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Không thể chọn dự án",
        description: getErrorMessage(error, "Không thể chọn dự án"),
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isUploading) {
      setName("");
      setDescription("");
      setType("");
      setDueDate("");
      filePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setFilePreviews([]);
      setImagePreviews([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-1.5rem)] overflow-y-auto border-none bg-white/95 p-0 shadow-2xl sm:max-w-4xl sm:rounded-[28px]">
        <div className="relative flex flex-col overflow-hidden bg-gradient-to-br from-white via-slate-50 to-sky-50">
          <div className="pointer-events-none absolute -left-48 -top-48 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-56 -right-44 h-[420px] w-[420px] rounded-full bg-sky-200/40 blur-[140px]" />

          <div className="relative px-8 pb-4 pt-14 sm:px-12 sm:pt-16">
            <DialogHeader className="space-y-4 text-left">
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                  Chọn dự án đã lưu trữ
                </DialogTitle>
                <DialogDescription className="max-w-2xl text-sm leading-relaxed text-slate-600">
                  Điền đầy đủ thông tin, chọn hạn chót và đính kèm tài liệu để
                  tạo lại dự án từ danh sách đã lưu trữ.
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="relative flex flex-col"
          >
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 px-8 pb-10 sm:px-12">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Chuyên ngành
                        {hasExistingMajor && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (từ dự án đã lưu trữ)
                          </span>
                        )}
                      </label>
                      <Select
                        value={majorId ? String(majorId) : undefined}
                        onValueChange={(value) => {
                          const foundMajor = activeMajors.find(
                            (major) => major.id === Number(value)
                          );
                          if (foundMajor) {
                            setMajorId(foundMajor.id ?? null);
                            setType(foundMajor.name ?? "");
                          }
                        }}
                        disabled={
                          hasExistingMajor ||
                          isLoadingMajors ||
                          activeMajors.length === 0 ||
                          isSubmitting ||
                          isUploading
                        }
                      >
                        <SelectTrigger className="h-12 justify-between rounded-xl border border-slate-200 bg-white/95 px-4 text-left shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed">
                          <SelectValue
                            placeholder={
                              hasExistingMajor
                                ? type || "Chuyên ngành từ dự án"
                                : "Chọn chuyên ngành"
                            }
                          >
                            {type}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-72 rounded-xl border border-white/70 bg-white/95 shadow-lg">
                          {activeMajors.map((major) => (
                            <SelectItem
                              key={major.id}
                              value={major.id ? String(major.id) : ""}
                              className="py-2 text-sm"
                            >
                              {major.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Tên dự án <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Nhập tên dự án"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 rounded-xl border-none bg-white/95 shadow-sm ring-1 ring-inset ring-slate-200 transition focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={
                          hasExistingMajor || isSubmitting || isUploading
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Mô tả <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Mô tả ngắn gọn mục tiêu, phạm vi và yêu cầu chính"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-xl border-none bg-white/95 shadow-sm ring-1 ring-inset ring-slate-200 transition focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={
                          hasExistingMajor || isSubmitting || isUploading
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Hạn nộp (nếu có)
                      </label>
                      <DatePicker
                        value={dueDate}
                        onChange={(value) => setDueDate(value ?? "")}
                        placeholder="Chọn hạn nộp"
                        formatter={dateFormatter}
                        fromDate={new Date()}
                        className="h-12 rounded-xl border-none bg-white/95 text-sm shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-white focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={
                          hasExistingMajor || isSubmitting || isUploading
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Thêm hạn chót giúp nhắc nhở cả nhóm bám sát tiến độ.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Tài liệu đính kèm (PDF, DOCX...)
                      </label>
                      <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-sky-200/20" />
                        <label
                          htmlFor="pick-project-documents"
                          className="relative flex cursor-pointer flex-col items-center gap-2 px-5 py-7 text-center text-sm text-muted-foreground transition hover:bg-primary/5"
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            handleDocumentFiles(
                              Array.from(event.dataTransfer.files || [])
                            );
                          }}
                        >
                          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                            <UploadIcon className="h-7 w-7" />
                          </span>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-primary">
                              Kéo thả tài liệu vào đây
                            </p>
                            <p>hoặc nhấp để chọn từ máy</p>
                          </div>
                          <input
                            id="pick-project-documents"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(event) => {
                              handleDocumentFiles(
                                Array.from(event.target.files || [])
                              );
                              event.target.value = "";
                            }}
                            disabled={isSubmitting || isUploading}
                          />
                        </label>

                        {filePreviews.length > 0 && (
                          <div className="relative border-t border-primary/20 bg-white/95 p-3">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Tài liệu đã chọn
                            </p>
                            <div className="mt-3 grid gap-3">
                              {filePreviews.map((item) => (
                                <figure
                                  key={item.id}
                                  className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs shadow-sm"
                                >
                                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                    <FileIcon className="h-5 w-5" />
                                  </span>
                                  <figcaption className="flex flex-1 items-start justify-between gap-2 overflow-hidden">
                                    <div className="flex-1 truncate text-left">
                                      <p
                                        className="truncate font-medium"
                                        title={item.name}
                                      >
                                        {item.name}
                                      </p>
                                      <p className="text-[10px] uppercase text-muted-foreground">
                                        {item.fileType || "Không rõ"}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-[11px]"
                                      onClick={() => {
                                        setFilePreviews((prev) =>
                                          prev.filter(
                                            (preview) => preview.id !== item.id
                                          )
                                        );
                                        URL.revokeObjectURL(item.previewUrl);
                                      }}
                                      disabled={isSubmitting || isUploading}
                                    >
                                      Xóa
                                    </Button>
                                  </figcaption>
                                </figure>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Hình ảnh minh họa
                      </label>
                      <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/30 via-transparent to-primary/10" />
                        <label
                          htmlFor="pick-project-images"
                          className="relative flex cursor-pointer flex-col items-center gap-2 px-5 py-7 text-center text-sm text-muted-foreground transition hover:bg-primary/5"
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            handleImageFiles(
                              Array.from(event.dataTransfer.files || [])
                            );
                          }}
                        >
                          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-primary shadow-inner">
                            <ImagePlus className="h-7 w-7" />
                          </span>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-primary">
                              Kéo thả hình ảnh vào đây
                            </p>
                            <p>hoặc nhấp để chọn từ máy</p>
                          </div>
                          <input
                            id="pick-project-images"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(event) => {
                              handleImageFiles(
                                Array.from(event.target.files || [])
                              );
                              event.target.value = "";
                            }}
                            disabled={isSubmitting || isUploading}
                          />
                        </label>

                        {imagePreviews.length > 0 && (
                          <div className="relative border-t border-primary/20 bg-white/95 p-3">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Hình ảnh đã chọn
                            </p>
                            <div className="mt-3 grid gap-3">
                              {imagePreviews.map((item) => (
                                <figure
                                  key={item.id}
                                  className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs shadow-sm"
                                >
                                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-sky-100">
                                    <img
                                      src={item.previewUrl}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </span>
                                  <figcaption className="flex flex-1 items-start justify-between gap-2">
                                    <div className="flex-1 truncate text-left">
                                      <p
                                        className="truncate font-medium"
                                        title={item.name}
                                      >
                                        {item.name}
                                      </p>
                                      <p className="text-[10px] uppercase text-muted-foreground">
                                        {item.fileType || "image"}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-[11px]"
                                      onClick={() => {
                                        setImagePreviews((prev) =>
                                          prev.filter(
                                            (preview) => preview.id !== item.id
                                          )
                                        );
                                        URL.revokeObjectURL(item.previewUrl);
                                      }}
                                      disabled={isSubmitting || isUploading}
                                    >
                                      Xóa
                                    </Button>
                                  </figcaption>
                                </figure>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="border-t border-white/60 bg-white/90 px-8 py-5 backdrop-blur sm:px-12">
              <DialogFooter className="gap-3 sm:gap-4">
                <Button
                  type="submit"
                  className="min-w-[150px] rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg transition hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                  disabled={
                    isSubmitting ||
                    isUploading ||
                    !name.trim() ||
                    !description.trim()
                  }
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Chọn dự án"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl border-none bg-white/70 text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-white"
                  onClick={handleClose}
                  disabled={isSubmitting || isUploading}
                >
                  Hủy
                </Button>
              </DialogFooter>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
