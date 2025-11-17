import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DeanLayout from "./layout";
import {
  projectQueryKeys,
  useCreateProjectMutation,
  useImportProjectsMutation,
  useProjectDetailQuery,
  useProjectsQuery,
} from "@/services/project/hooks";
import type {
  ProjectDetailResponseDto,
  ProjectImageInfoDto,
  ProjectListItemDto,
} from "@/services/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Eye,
  FilePlus,
  ImageIcon,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  Paperclip,
  PlusCircle,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { formatDateDisplay } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import {
  useAssignCouncilMutation,
  useCouncilListQuery,
  useDeanDecisionMutation,
} from "@/services/council/hooks";
import {
  useUploadFileMutation,
  useUploadImageMutation,
} from "@/services/upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/ui/table-pagination";

const isPendingStatus = (status?: string | null) =>
  (status ?? "").toString().toLowerCase() === "pending";

function statusToLabel(status?: string | null): string {
  switch ((status ?? "").toString().toLowerCase()) {
    case "pending":
      return "Đang chờ";
    case "inreview":
      return "Đang xem xét";
    case "approved":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
    case "inprogress":
      return "Đang thực hiện";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status ?? "Không rõ";
  }
}

function statusToBadgeConfig(status?: string | null): {
  variant: BadgeProps["variant"];
  className?: string;
} {
  const normalized = (status ?? "").toString().toLowerCase();

  if (normalized === "pending") {
    return {
      variant: "outline",
      className:
        "border-transparent bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100",
    };
  }

  if (normalized === "approved" || normalized === "completed") {
    return { variant: "default" };
  }

  if (normalized === "inreview") {
    return { variant: "secondary" };
  }

  if (normalized === "rejected" || normalized === "cancelled") {
    return { variant: "destructive" };
  }

  return { variant: "outline" };
}

const createProjectSchema = z.object({
  name: z.string().trim().min(3, "Tên dự án phải có ít nhất 3 ký tự."),
  type: z
    .string()
    .trim()
    .max(100, "Loại dự án tối đa 100 ký tự.")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(2000, "Mô tả tối đa 2000 ký tự.")
    .optional()
    .or(z.literal("")),
  dueDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value) return true;
        return !Number.isNaN(Date.parse(value));
      },
      { message: "Ngày không hợp lệ." }
    ),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

type PreviewItem = {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly previewUrl: string;
  readonly file: File;
  readonly fileType: string;
};

function ProjectsTable({
  projects,
  isLoading,
  onDecide,
  approvingId,
  onView,
}: {
  readonly projects: ProjectListItemDto[];
  readonly isLoading?: boolean;
  readonly onDecide: (
    project: ProjectListItemDto,
    decision: "APPROVED" | "REJECTED"
  ) => void;
  readonly approvingId?: number | null;
  readonly onView: (project: ProjectListItemDto) => void;
}) {
  const loadingRows = Array.from({ length: 5 }, (_, index) => index);

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-background/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Mã</TableHead>
            <TableHead>Tên dự án</TableHead>
            <TableHead className="w-[140px]">Loại</TableHead>
            <TableHead className="w-[200px]">Chủ nhiệm</TableHead>
            <TableHead className="w-[160px]">Hạn chót</TableHead>
            <TableHead className="w-[140px]">Trạng thái</TableHead>
            <TableHead className="w-[140px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            loadingRows.map((index) => (
              <TableRow key={`pending-project-loading-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-9 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : projects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-12 text-center text-sm text-muted-foreground"
              >
                Không có dự án nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project, index) => {
              const dueDateLabel = formatDateDisplay(project.dueDate) ?? "—";
              const owner = project.ownerName ?? "—";
              const pending = isPendingStatus(project.status);
              const badgeConfig = statusToBadgeConfig(project.status);
              const rowKey = project.id ?? project.name ?? `project-${index}`;
              return (
                <TableRow key={rowKey} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    {project.id ? `PRJ-${project.id}` : "—"}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {project.name ?? "Không rõ"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.type ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {owner}
                  </TableCell>
                  <TableCell>{dueDateLabel}</TableCell>
                  <TableCell>
                    <Badge
                      variant={badgeConfig.variant}
                      className={cn(
                        "capitalize whitespace-nowrap",
                        badgeConfig.className
                      )}
                    >
                      {statusToLabel(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={() => onView(project)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">
                          Xem {project.name ?? "dự án"}
                        </span>
                      </Button>
                      {pending && project.id ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              disabled={approvingId === project.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">
                                Mở tùy chọn quyết định
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => onDecide(project, "APPROVED")}
                              className="text-emerald-600 hover:text-emerald-600 focus:text-emerald-600"
                            >
                              Duyệt dự án
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDecide(project, "REJECTED")}
                              className="text-destructive hover:text-destructive focus:text-destructive"
                            >
                              Từ chối dự án
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ProjectImageThumb({
  image,
  alt,
}: {
  readonly image: ProjectImageInfoDto;
  readonly alt: string;
}) {
  const [hasError, setHasError] = useState(false);
  const showFallback = hasError || !image.url;

  return (
    <figure className="group overflow-hidden rounded-lg border border-border/40 bg-muted/20">
      {showFallback ? (
        <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs">Không thể tải ảnh</span>
        </div>
      ) : (
        <img
          src={image.url ?? ""}
          alt={alt}
          className="h-40 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      )}
      <figcaption className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
        <ImageIcon className="h-3.5 w-3.5" />
        <span className="truncate">{image.url ?? "(Không rõ)"}</span>
      </figcaption>
    </figure>
  );
}

interface ProjectDetailsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly project: ProjectListItemDto | null;
  readonly detail: ProjectDetailResponseDto | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

function ProjectDetailsDialog({
  open,
  onOpenChange,
  project,
  detail,
  isLoading,
  error,
}: ProjectDetailsDialogProps) {
  const status = detail?.status ?? project?.status;
  const statusLabel = statusToLabel(status);
  const badgeConfig = statusToBadgeConfig(status);
  const dueDate = formatDateDisplay(detail?.dueDate ?? project?.dueDate) ?? "—";
  const createdAt = formatDateDisplay(detail?.createDate) ?? "—";
  const ownerName = detail?.owner?.name ?? project?.ownerName ?? "—";
  const ownerEmail = detail?.owner?.email ?? "—";
  const description =
    (detail?.description ?? project?.description ?? "").trim() ||
    "Không có mô tả.";
  const files = detail?.files ?? [];
  const images = detail?.images ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-6">
        <DialogHeader className="space-y-1">
          <DialogTitle>{project?.name ?? "Chi tiết dự án"}</DialogTitle>
          <DialogDescription>
            {project?.id ? `Mã dự án: PRJ-${project.id}` : "Mã dự án: —"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Không thể tải chi tiết dự án. Vui lòng thử lại sau.
            </p>
          ) : (
            <>
              <section>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Thông tin chung
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Trạng thái</p>
                    <Badge
                      variant={badgeConfig.variant}
                      className={cn("mt-1 capitalize", badgeConfig.className)}
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loại dự án</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {detail?.type ?? project?.type ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày tạo</p>
                    <p className="mt-1 text-sm text-foreground">{createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hạn chót</p>
                    <p className="mt-1 text-sm text-foreground">{dueDate}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Chủ nhiệm
                </h3>
                <div className="mt-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                  <p className="text-sm font-medium text-foreground">
                    {ownerName}
                  </p>
                  <p className="text-xs text-muted-foreground">{ownerEmail}</p>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Mô tả
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                  {description}
                </p>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Tệp đính kèm ({files.length})
                </h3>
                {files.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Không có tệp đính kèm.
                  </p>
                ) : (
                  <ScrollArea className="mt-3 max-h-60 pr-3">
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li
                          key={file.id ?? file.filePath ?? `file-${index}`}
                          className="flex items-center gap-3 rounded-md border border-border/40 bg-background px-3 py-2"
                        >
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {file.filePath ?? "Không rõ đường dẫn"}
                          </span>
                          {file.type ? (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {file.type}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Hình ảnh ({images.length})
                </h3>
                {images.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Không có hình ảnh.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {images.map((image, index) => (
                      <ProjectImageThumb
                        key={image.id ?? image.url ?? `image-${index}`}
                        image={image}
                        alt={project?.name ?? "Ảnh dự án"}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeanProjectsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });
  const { page, pageSize, setTotalItems, setPage, setPageSize } = pagination;

  const { data, isLoading, isFetching } = useProjectsQuery({
    page: Math.max(0, page - 1),
    size: pageSize,
    name: debouncedSearch || undefined,
  });

  const projects = data?.content ?? [];
  const queryClient = useQueryClient();
  const [approvalTarget, setApprovalTarget] =
    useState<ProjectListItemDto | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectListItemDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionChoice, setDecisionChoice] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);
  const [selectedCouncilId, setSelectedCouncilId] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importInputKey, setImportInputKey] = useState(0);
  const [filePreviews, setFilePreviews] = useState<PreviewItem[]>([]);
  const [imagePreviews, setImagePreviews] = useState<PreviewItem[]>([]);
  const { toast } = useToast();

  const createProjectForm = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      dueDate: "",
    },
  });

  const councilsQuery = useCouncilListQuery();
  const councils = councilsQuery.data ?? [];
  const assignMutation = useAssignCouncilMutation();
  const decisionMutation = useDeanDecisionMutation({
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(variables.projectId),
        }),
      ]);
    },
  });
  const createProjectMutation = useCreateProjectMutation();
  const uploadImageMutation = useUploadImageMutation();
  const uploadFileMutation = useUploadFileMutation();
  const importProjectsMutation = useImportProjectsMutation();
  const isProcessing = assignMutation.isPending || decisionMutation.isPending;
  const detailQuery = useProjectDetailQuery(selectedProject?.id ?? null, {
    enabled: detailOpen && Boolean(selectedProject?.id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const isCreating = createProjectMutation.isPending;
  const isUploadingAttachments =
    uploadImageMutation.isPending || uploadFileMutation.isPending;
  const isImporting = importProjectsMutation.isPending;

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
    setCreateOpen(false);
    resetCreateProjectForm();
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

  const resetImportState = () => {
    setImportFile(null);
    setImportInputKey((value) => value + 1);
  };

  const closeImportDialog = () => {
    setImportOpen(false);
    resetImportState();
  };

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImportFile(null);
      return;
    }

    const allowedExtensions = ["csv", "xlsx", "xls"];
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.includes(extension)) {
      toast({
        variant: "destructive",
        title: "Định dạng tệp không hợp lệ",
        description: "Chỉ hỗ trợ các tệp .csv, .xls hoặc .xlsx.",
      });
      event.target.value = "";
      setImportFile(null);
      return;
    }

    setImportFile(file);
  };

  const handleImportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!importFile) {
      toast({
        variant: "destructive",
        title: "Chưa chọn tệp",
        description: "Vui lòng chọn một tệp danh sách dự án để tiếp tục.",
      });
      return;
    }

    try {
      await importProjectsMutation.mutateAsync({ file: importFile });
      toast({
        title: "Đã nhập danh sách dự án",
        description:
          "Hệ thống sẽ xử lý dữ liệu và cập nhật bảng dự án trong giây lát.",
      });
      closeImportDialog();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể nhập danh sách",
        description:
          error instanceof Error
            ? error.message
            : "Vui lòng kiểm tra lại tệp và thử lại.",
      });
    }
  };

  useEffect(() => {
    if (!confirmOpen) return;
    if (decisionChoice !== "APPROVED") return;
    if (selectedCouncilId) return;
    if (councils.length > 0) {
      const firstId = councils[0]?.id;
      if (firstId != null) {
        setSelectedCouncilId(String(firstId));
      }
    }
  }, [confirmOpen, councils, selectedCouncilId, decisionChoice]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const keyword = searchTerm.trim().toLowerCase();
    return projects.filter((project) => {
      const haystack = [
        project.id ? `prj-${project.id}` : undefined,
        project.name,
        project.type,
        project.ownerName,
      ]
        .map((value) => value?.toLowerCase())
        .filter(Boolean) as string[];
      return haystack.some((value) => value.includes(keyword));
    });
  }, [projects, searchTerm]);

  const handleDecisionSelect = (
    project: ProjectListItemDto,
    decision: "APPROVED" | "REJECTED"
  ) => {
    setApprovalTarget(project);
    setDecisionChoice(decision);
    setConfirmOpen(true);
    setDecisionComment("");
    setSelectedCouncilId("");
  };

  const handleViewProject = (project: ProjectListItemDto) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const handleSubmitDecision = async () => {
    if (!approvalTarget?.id) {
      toast({
        variant: "destructive",
        title: "Không thể duyệt dự án",
        description: "Thiếu thông tin mã dự án.",
      });
      setConfirmOpen(false);
      setApprovalTarget(null);
      setDecisionComment("");
      return;
    }

    if (!decisionChoice) {
      toast({
        variant: "destructive",
        title: "Chưa có quyết định",
        description: "Vui lòng chọn hành động trước khi gửi.",
      });
      return;
    }

    let assignedSuccessfully = false;
    try {
      if (requiresCouncil) {
        const councilIdNumber = Number(selectedCouncilId);
        const councilExists = councils.some(
          (council) => council.id === councilIdNumber
        );
        if (
          !Number.isInteger(councilIdNumber) ||
          councilIdNumber <= 0 ||
          !councilExists
        ) {
          toast({
            variant: "destructive",
            title: "Chưa chọn hội đồng",
            description: "Vui lòng chọn một hội đồng trước khi duyệt dự án.",
          });
          return;
        }

        await assignMutation.mutateAsync({
          projectId: approvalTarget.id,
          councilId: councilIdNumber,
        });
        assignedSuccessfully = true;
      }
      await decisionMutation.mutateAsync({
        projectId: approvalTarget.id,
        body: {
          decision: decisionChoice,
          comment: decisionComment.trim() || undefined,
        },
      });
      toast({
        title:
          decisionChoice === "APPROVED" ? "Đã duyệt dự án" : "Đã từ chối dự án",
        description: `${
          approvalTarget.name ?? "Dự án"
        } đã được chuyển sang trạng thái ${statusToLabel(decisionChoice)}.`,
      });
      setConfirmOpen(false);
      setApprovalTarget(null);
      setDecisionComment("");
      setDecisionChoice(null);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Duyệt dự án thất bại",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
      });
      if (assignedSuccessfully) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
          queryClient.invalidateQueries({
            queryKey: projectQueryKeys.detail(approvalTarget.id),
          }),
        ]);
      }
    }
  };

  const requiresCouncil = decisionChoice === "APPROVED";
  const hasValidSelection = requiresCouncil
    ? councils.some((council) => String(council.id) === selectedCouncilId)
    : true;
  const isConfirmDisabled =
    isProcessing ||
    !decisionChoice ||
    (requiresCouncil &&
      (councilsQuery.isLoading || councils.length === 0 || !hasValidSelection));
  const isRejecting = decisionChoice === "REJECTED";
  const decisionLabel = decisionChoice ? statusToLabel(decisionChoice) : "";
  const confirmButtonText = isProcessing
    ? "Đang gửi..."
    : decisionChoice
    ? `${isRejecting ? "Từ chối" : "Duyệt"} dự án`
    : "Gửi quyết định";
  const projectName = approvalTarget?.name ?? "dự án này";

  useEffect(() => {
    setTotalItems(data?.totalElements ?? 0);
  }, [data?.totalElements, setTotalItems]);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dự án</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi danh sách dự án và duyệt những dự án đang ở trạng thái{" "}
              {statusToLabel("Pending")}.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
              placeholder="Tìm theo mã, tên dự án, hoặc chủ nhiệm"
            />
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setImportOpen(true)}
              disabled={isImporting}
            >
              <UploadCloud className="h-4 w-4" />
              {isImporting ? "Đang nhập..." : "Import danh sách"}
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Tạo dự án
            </Button>
          </div>
        </div>
      </header>

      <ProjectsTable
        projects={filteredProjects}
        isLoading={isLoading || isFetching}
        onDecide={handleDecisionSelect}
        approvingId={isProcessing ? approvalTarget?.id ?? null : null}
        onView={handleViewProject}
      />

      <div className="pt-4">
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={data?.totalElements ?? 0}
          totalPages={pagination.totalPages}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          hasNext={pagination.hasNext}
          hasPrevious={pagination.hasPrevious}
          isLoading={isLoading}
          isFetching={isFetching}
          onPrevious={() => pagination.previousPage()}
          onNext={() => pagination.nextPage()}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => setPageSize(s)}
        />
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            resetCreateProjectForm();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-hidden border border-border/60 bg-background p-0 shadow-2xl">
          <div className="border-b border-border/60 px-6 py-6 text-left sm:px-10">
            <DialogHeader className="items-start text-left">
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Tạo dự án mới
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Điền thông tin chính và đính kèm tài liệu trước khi gửi cho hội
                đồng. Bạn có thể cập nhật sau khi dự án được khởi tạo.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-wider text-muted-foreground">
              <span>
                Tệp đính kèm: {filePreviews.length + imagePreviews.length}
              </span>
            </div>
          </div>
          <ScrollArea className="max-h-[calc(90vh-130px)]">
            <div className="px-6 pb-8 pt-6 sm:px-10">
              <Form {...createProjectForm}>
                <form
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
                                  <Input
                                    {...field}
                                    placeholder="Ví dụ: AI, Marketing, IoT..."
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
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Tên dự án *
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
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Hạn nộp (nếu có)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    disabled={
                                      isCreating || isUploadingAttachments
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">
                          Gợi ý trình bày
                        </p>
                        <ul className="mt-3 space-y-2 text-xs leading-relaxed">
                          <li>
                            • Nêu rõ mục tiêu, phạm vi và lợi ích mong đợi.
                          </li>
                          <li>
                            • Đính kèm ít nhất một tài liệu mô tả chi tiết đề
                            tài.
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
                                  <button
                                    type="button"
                                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                                    onClick={() => removeImagePreview(item.id)}
                                    disabled={
                                      isCreating || isUploadingAttachments
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Xóa ảnh</span>
                                  </button>
                                  <div className="px-3 py-2 text-xs text-muted-foreground">
                                    {item.name}
                                  </div>
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

                  <DialogFooter className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Tài liệu được lưu an toàn và có thể cập nhật sau khi dự án
                      được tạo.
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
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) {
            resetImportState();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import danh sách dự án</DialogTitle>
            <DialogDescription>
              Tải lên tệp Excel hoặc CSV theo định dạng mẫu để thêm hàng loạt dự
              án.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Tệp danh sách
              </Label>
              <Input
                key={importInputKey}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleImportFileChange}
                disabled={isImporting}
              />
              <p className="text-xs text-muted-foreground">
                Hỗ trợ .csv, .xls, .xlsx (tối đa ~5MB). Hãy dùng mẫu với các cột
                cơ bản: Tên dự án, Loại, Hạn chót, Mô tả, Chủ nhiệm.
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm">
              {importFile ? (
                <div>
                  <p className="font-medium text-foreground">
                    {importFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(importFile.size)}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Chưa có tệp được chọn. Vui lòng chọn tệp trước khi nhập.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeImportDialog}
                disabled={isImporting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isImporting || !importFile}>
                {isImporting ? "Đang nhập..." : "Nhập danh sách"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setDecisionComment("");
            setDecisionChoice(null);
            setApprovalTarget(null);
            setSelectedCouncilId("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {decisionChoice
                ? isRejecting
                  ? "Xác nhận từ chối dự án"
                  : "Xác nhận duyệt dự án"
                : "Ra quyết định cho dự án"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {decisionChoice
                ? `Bạn sắp ${
                    isRejecting ? "từ chối" : "duyệt"
                  } ${projectName}. Bạn có thể kèm theo ghi chú để thông tin cho các bên liên quan.`
                : "Chọn quyết định phù hợp từ danh sách hành động."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Quyết định</p>
              {decisionChoice ? (
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-3 py-2 text-sm",
                    isRejecting
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                  )}
                >
                  <Badge
                    variant={isRejecting ? "destructive" : "default"}
                    className="capitalize whitespace-nowrap"
                  >
                    {decisionLabel}
                  </Badge>
                  <span className="leading-relaxed">
                    {isRejecting
                      ? "Hãy đảm bảo lý do rõ ràng, quyết định sẽ thông báo đến các bên liên quan."
                      : "Dự án sẽ được đánh dấu đã duyệt và thông báo tới các bên liên quan."}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Vui lòng chọn quyết định từ danh sách hành động.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Chọn hội đồng thực hiện
              </p>
              {requiresCouncil ? (
                <>
                  <Select
                    value={selectedCouncilId}
                    onValueChange={setSelectedCouncilId}
                    disabled={
                      isProcessing ||
                      councilsQuery.isLoading ||
                      councils.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          councilsQuery.isLoading
                            ? "Đang tải danh sách hội đồng..."
                            : "Chọn hội đồng"
                        }
                      />
                    </SelectTrigger>
                    {councils.length > 0 ? (
                      <SelectContent>
                        {councils.map((council) => {
                          const label =
                            [
                              council.councilName ?? undefined,
                              council.councilCode
                                ? `(${council.councilCode})`
                                : undefined,
                            ]
                              .filter(Boolean)
                              .join(" ") || `Hội đồng ${council.id}`;
                          return (
                            <SelectItem
                              key={council.id}
                              value={String(council.id)}
                            >
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    ) : null}
                  </Select>
                  {councilsQuery.isError ? (
                    <p className="text-sm text-destructive">
                      Không thể tải danh sách hội đồng. Vui lòng thử lại sau.
                    </p>
                  ) : null}
                  {councils.length === 0 && !councilsQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Chưa có hội đồng nào sẵn sàng. Hãy tạo hội đồng trước khi
                      duyệt dự án.
                    </p>
                  ) : null}
                </>
              ) : (
                <div className="rounded-md border border-muted-foreground/20 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  Từ chối dự án không cần chỉ định hội đồng.
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Ghi chú (tuỳ chọn)
              </p>
              <Textarea
                value={decisionComment}
                onChange={(event) => setDecisionComment(event.target.value)}
                placeholder="Nhập ghi chú cho quyết định này"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitDecision}
              disabled={isConfirmDisabled}
              className={cn(
                isRejecting &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
              )}
            >
              {confirmButtonText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProjectDetailsDialog
        open={detailOpen}
        onOpenChange={(open: boolean) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedProject(null);
          }
        }}
        project={selectedProject}
        detail={detailQuery.data ?? null}
        isLoading={detailQuery.isLoading || detailQuery.isFetching}
        error={detailQuery.isError ? detailQuery.error : null}
      />
    </div>
  );
}

export default function DeanProjectsPage() {
  return (
    <DeanLayout>
      <DeanProjectsContent />
    </DeanLayout>
  );
}
