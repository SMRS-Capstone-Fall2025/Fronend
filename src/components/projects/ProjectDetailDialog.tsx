import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateDisplay, formatDateTimeDisplay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useProjectMilestonesQuery } from "@/services/milestone";
import { useTasksListQuery } from "@/services/task/hooks";
import type {
  ProjectDetailResponseDto,
  ProjectImageInfoDto,
  ProjectListItemDto,
} from "@/services/types";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Folder,
  ImageIcon,
  Image as ImageLucide,
  ListTodo,
  Paperclip,
  Target,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  statusToLabel,
  statusToBadgeConfig,
} from "@/components/projects/ProjectsTable";

interface ProjectImageThumbProps {
  readonly image: ProjectImageInfoDto;
  readonly alt: string;
}

interface ProjectImageThumbProps {
  readonly image: ProjectImageInfoDto;
  readonly alt: string;
  readonly onClick?: () => void;
}

function ProjectImageThumb({ image, alt, onClick }: ProjectImageThumbProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = image.url ?? "";

  if (imageError || !imageUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed bg-muted/50">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <p className="text-xs">Không thể tải ảnh</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      <img
        src={imageUrl}
        alt={alt}
        className="aspect-video w-full object-cover transition-all duration-300 group-hover:scale-110"
        onError={() => setImageError(true)}
      />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <p className="text-xs font-medium truncate">{alt}</p>
      </div>
    </div>
  );
}

interface ProjectDetailDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly project: ProjectListItemDto | null;
  readonly detail: ProjectDetailResponseDto | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function ProjectDetailDialog({
  open,
  onOpenChange,
  project,
  detail,
  isLoading,
  error,
}: ProjectDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const projectId = project?.id ?? detail?.id ?? null;

  const status = project?.status ?? detail?.status ?? null;
  const statusLabel = statusToLabel(status);
  const badgeConfig = statusToBadgeConfig(status);
  const isRevisionRequired = status === "RevisionRequired";

  const createdAt = formatDateDisplay(detail?.createDate ?? "—");
  const dueDate = formatDateDisplay(detail?.dueDate ?? project?.dueDate) ?? "—";
  const description = detail?.description ?? "Không có mô tả.";
  const ownerName = detail?.owner?.name ?? project?.ownerName ?? "Không rõ";
  const ownerEmail = detail?.owner?.email ?? "—";
  // Get rejection info from project list first, fallback to detail
  const rejectionReason = project?.rejectionReason ?? detail?.rejectionReason;
  const rejectionFeedback =
    project?.rejectionFeedback ?? detail?.rejectionFeedback;
  const revisionDeadline =
    project?.revisionDeadline ?? detail?.revisionDeadline
      ? formatDateDisplay(
          project?.revisionDeadline ?? detail?.revisionDeadline ?? ""
        )
      : null;

  const files = detail?.files ?? [];
  const images = detail?.images ?? [];
  const members = detail?.members ?? [];
  const owner = detail?.owner;
  const lecturer = detail?.lecturer;
  const hasOwner = Boolean(owner?.name || owner?.email);
  const hasLecturer = Boolean(lecturer?.name || lecturer?.email);
  const totalMembersCount =
    members.length + (hasOwner ? 1 : 0) + (hasLecturer ? 1 : 0);

  const translateRole = (role: string | null | undefined): string => {
    if (!role) return "Thành viên";
    const roleUpper = role.toUpperCase();
    switch (roleUpper) {
      case "OWNER":
        return "Trưởng nhóm";
      case "LECTURER":
      case "MENTOR":
        return "Giảng viên";
      case "STUDENT":
        return "Sinh viên";
      case "ADMIN":
        return "Quản trị viên";
      case "DEAN":
        return "Trưởng khoa";
      default:
        return role;
    }
  };

  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useTasksListQuery(
    {
      projectId: projectId ?? undefined,
      page: 1,
      size: 1000,
    },
    {
      enabled: open && projectId != null,
    }
  );

  const {
    data: milestonesData,
    isLoading: milestonesLoading,
    isError: milestonesError,
  } = useProjectMilestonesQuery(projectId, {
    enabled: open && projectId != null,
  });

  const tasks = useMemo(() => tasksData?.data?.items ?? [], [tasksData]);
  const milestones = useMemo(() => milestonesData ?? [], [milestonesData]);

  useEffect(() => {
    if (!open) {
      setActiveTab("overview");
    }
  }, [open]);

  const getTaskStatusBadge = (status: string | null | undefined) => {
    const statusLower = (status ?? "").toLowerCase();
    switch (statusLower) {
      case "to_do":
        return {
          label: "Chưa làm",
          className:
            "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
        };
      case "in_progress":
        return {
          label: "Đang làm",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
        };
      case "done":
        return {
          label: "Hoàn thành",
          className:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
        };
      default:
        return {
          label: "Không xác định",
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const getMilestoneStatusBadge = (status: string | null | undefined) => {
    const statusLower = (status ?? "").toLowerCase();
    switch (statusLower) {
      case "pending":
        return {
          label: "Đang thực hiện",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
        };
      case "completed":
        return {
          label: "Hoàn thành",
          className:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
        };
      case "submitted":
        return {
          label: "Đã nộp",
          className:
            "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-indigo-500/30",
        };
      case "delayed":
        return {
          label: "Trễ hạn",
          className:
            "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          className:
            "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
        };
      default:
        return {
          label: status ?? "Không xác định",
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl gap-0 max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-b border-blue-600/20 px-8 py-6 shadow-lg">
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                  <Folder className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                    {project?.name ?? "Chi tiết dự án"}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-sm font-medium flex items-center gap-2 text-blue-100">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium">
                      <FileText className="h-3 w-3" />
                      {project?.id ? `PRJ-${project.id}` : "—"}
                    </span>
                    {detail?.type && (
                      <>
                        <span className="text-blue-200">•</span>
                        <span className="text-blue-100">{detail.type}</span>
                      </>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </div>
            <Badge
              variant={badgeConfig.variant}
              className={cn(
                "capitalize shrink-0 text-sm px-4 py-2 font-semibold shadow-lg bg-white/90 backdrop-blur-sm",
                badgeConfig.className
              )}
            >
              {statusLabel}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 max-h-[calc(90vh-200px)] px-8 overflow-auto">
          <div className="py-8">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 flex items-start gap-4 shadow-sm">
                <div className="rounded-full bg-destructive/10 p-3">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-destructive">
                    Không thể tải chi tiết dự án
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">
                    Vui lòng thử lại sau hoặc liên hệ quản trị viên.
                  </p>
                </div>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="gap-2">
                    <ListTodo className="h-4 w-4" />
                    Task ({tasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="milestones" className="gap-2">
                    <Target className="h-4 w-4" />
                    Milestone ({milestones.length})
                  </TabsTrigger>
                  <TabsTrigger value="members" className="gap-2">
                    <Users className="h-4 w-4" />
                    Thành viên ({totalMembersCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-5 mt-0">
                  <>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20 p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2.5">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Ngày tạo
                            </p>
                            <p className="text-sm font-semibold text-foreground truncate">
                              {createdAt}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50/50 to-background dark:from-amber-950/20 p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2.5">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Hạn chót
                            </p>
                            <p className="text-sm font-semibold text-foreground truncate">
                              {dueDate}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20 p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2.5">
                            <Folder className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Loại dự án
                            </p>
                            <p className="text-sm font-semibold text-foreground truncate">
                              {detail?.type ?? project?.type ?? "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <section className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          Trưởng nhóm
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-md ring-4 ring-primary/10">
                          {ownerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-foreground truncate">
                            {ownerName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {ownerEmail}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          Mô tả dự án
                        </h3>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-4">
                        <p className="whitespace-pre-line text-sm text-foreground leading-relaxed">
                          {description}
                        </p>
                      </div>
                    </section>

                    {isRevisionRequired &&
                      (rejectionReason ||
                        rejectionFeedback ||
                        revisionDeadline) && (
                        <section className="rounded-xl border border-amber-200 bg-amber-50/80 dark:bg-amber-950/20 p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                              Thông tin yêu cầu sửa đổi
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {revisionDeadline && (
                              <div className="flex items-center gap-3 rounded-lg bg-white/60 dark:bg-amber-900/20 px-4 py-3">
                                <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                                    Hạn nộp lại
                                  </p>
                                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                    {revisionDeadline}
                                  </p>
                                </div>
                              </div>
                            )}

                            {rejectionReason && (
                              <div className="rounded-lg bg-white/60 dark:bg-amber-900/20 px-4 py-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                    Lý do từ chối
                                  </p>
                                </div>
                                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed pl-6">
                                  {rejectionReason}
                                </p>
                              </div>
                            )}

                            {rejectionFeedback && (
                              <div className="rounded-lg bg-white/60 dark:bg-amber-900/20 px-4 py-3 space-y-2">
                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                  Phản hồi chi tiết
                                </p>
                                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line">
                                  {rejectionFeedback}
                                </p>
                              </div>
                            )}
                          </div>
                        </section>
                      )}

                    <section className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Paperclip className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                            Tệp đính kèm
                          </h3>
                        </div>
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {files.length}
                        </span>
                      </div>
                      {files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="rounded-full bg-muted p-3 mb-3">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Không có tệp đính kèm
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Chưa có tài liệu nào được tải lên
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-64">
                          <ul className="space-y-2">
                            {files.map((file, index) => (
                              <li
                                key={
                                  file.id ?? file.filePath ?? `file-${index}`
                                }
                                className="group flex items-center gap-3 rounded-lg border bg-background/50 px-4 py-3 hover:bg-background hover:shadow-sm transition-all"
                              >
                                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-2.5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                                  <Paperclip className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                    {file.filePath
                                      ? file.filePath.split("/").pop() ??
                                        file.filePath
                                      : "Không rõ đường dẫn"}
                                  </p>
                                  {file.type ? (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {file.type}
                                    </p>
                                  ) : null}
                                </div>
                                {file.filePath && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    asChild
                                  >
                                    <a
                                      href={file.filePath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Tải xuống
                                    </a>
                                  </Button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      )}
                    </section>

                    <section className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <ImageLucide className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                            Hình ảnh
                          </h3>
                        </div>
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {images.length}
                        </span>
                      </div>
                      {images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="rounded-full bg-muted p-3 mb-3">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Không có hình ảnh
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Chưa có ảnh nào được tải lên
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {images.map((image, index) => (
                            <ProjectImageThumb
                              key={image.id ?? image.url ?? `image-${index}`}
                              image={image}
                              alt={project?.name ?? "Ảnh dự án"}
                              onClick={() => setPreviewImage(image.url ?? null)}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                </TabsContent>

                <TabsContent value="tasks" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <ListTodo className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        Danh sách công việc
                      </h3>
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {tasks.length}
                      </span>
                    </div>
                    {tasksLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-24 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : tasksError ? (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
                        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <p className="text-sm font-medium text-destructive">
                          Không thể tải danh sách task
                        </p>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                        <ListTodo className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Chưa có task nào
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task) => {
                          const statusBadge = getTaskStatusBadge(task.status);
                          const deadlineLabel = formatDateDisplay(
                            task.deadline
                          );
                          const assignedName = task.assignedTo?.name ?? null;
                          const milestoneName = task.milestoneName ?? null;
                          return (
                            <div
                              key={task.id}
                              className="rounded-lg border bg-card p-4 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-foreground">
                                      {task.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        statusBadge.className
                                      )}
                                    >
                                      {statusBadge.label}
                                    </Badge>
                                  </div>
                                  {task.description && (
                                    <div
                                      className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-a:text-primary prose-a:underline hover:prose-a:no-underline"
                                      dangerouslySetInnerHTML={{
                                        __html: task.description,
                                      }}
                                    />
                                  )}
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    {deadlineLabel && (
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{deadlineLabel}</span>
                                      </div>
                                    )}
                                    {milestoneName && (
                                      <div className="flex items-center gap-1.5">
                                        <Target className="h-3.5 w-3.5" />
                                        <span>{milestoneName}</span>
                                      </div>
                                    )}
                                    {assignedName && (
                                      <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        <span>{assignedName}</span>
                                      </div>
                                    )}
                                    {task.progressPercent != null && (
                                      <div className="flex items-center gap-2">
                                        <Progress
                                          value={task.progressPercent}
                                          className="h-2 w-24"
                                        />
                                        <span>{task.progressPercent}%</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="milestones" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        Tiến độ dự án
                      </h3>
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {milestones.length}
                      </span>
                    </div>
                    {milestonesLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-32 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : milestonesError ? (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
                        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <p className="text-sm font-medium text-destructive">
                          Không thể tải danh sách milestone
                        </p>
                      </div>
                    ) : milestones.length === 0 ? (
                      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                        <Target className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Chưa có milestone nào
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {milestones.map((milestone) => {
                          const statusBadge = getMilestoneStatusBadge(
                            milestone.status
                          );
                          const dueDateLabel = formatDateDisplay(
                            milestone.dueDate
                          );
                          const createdAtLabel = formatDateTimeDisplay(
                            milestone.createdAt
                          );
                          return (
                            <div
                              key={milestone.id}
                              className="rounded-lg border bg-card p-4 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-foreground">
                                      {milestone.description ??
                                        "Milestone không có mô tả"}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        statusBadge.className
                                      )}
                                    >
                                      {statusBadge.label}
                                    </Badge>
                                    {milestone.isFinal && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                                      >
                                        Final
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    {dueDateLabel && (
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Hạn: {dueDateLabel}</span>
                                      </div>
                                    )}
                                    {createdAtLabel && (
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Tạo: {createdAtLabel}</span>
                                      </div>
                                    )}
                                    {milestone.progressPercent != null && (
                                      <div className="flex items-center gap-2">
                                        <Progress
                                          value={milestone.progressPercent}
                                          className="h-2 w-32"
                                        />
                                        <span>
                                          {milestone.progressPercent}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {milestone.reportUrl && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                      <span className="text-muted-foreground">
                                        Đã nộp báo cáo
                                        {milestone.reportSubmittedAt &&
                                          ` vào ${formatDateTimeDisplay(
                                            milestone.reportSubmittedAt
                                          )}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="members" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        Thành viên dự án
                      </h3>
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {totalMembersCount}
                      </span>
                    </div>
                    {totalMembersCount === 0 ? (
                      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                        <Users className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Chưa có thành viên nào
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {hasOwner && (
                          <div className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 ring-2 ring-primary/30 shrink-0">
                                <AvatarFallback className="text-base font-bold bg-gradient-to-br from-primary/30 to-primary/20 text-primary">
                                  {ownerName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-base font-semibold text-foreground truncate">
                                        {ownerName}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-primary/10 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/40"
                                      >
                                        <User className="h-3 w-3 mr-1" />
                                        Trưởng nhóm
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                                      {ownerEmail}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                      {translateRole(owner?.role ?? "OWNER")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {hasLecturer && (
                          <div className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 ring-2 ring-blue-300 shrink-0">
                                <AvatarFallback className="text-base font-bold bg-gradient-to-br from-blue-500/20 to-blue-400/10 text-blue-600 dark:text-blue-400">
                                  {(lecturer?.name ?? "L")
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-base font-semibold text-foreground truncate">
                                        {lecturer?.name ?? "Chưa cập nhật"}
                                      </p>
                                      {lecturer?.status?.toLowerCase() ===
                                        "approved" && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Đã duyệt
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                                      {lecturer?.email ?? "—"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                      {translateRole("LECTURER")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {members.map((member) => {
                          const memberStatus = (
                            member.status ?? ""
                          ).toLowerCase();
                          const isApproved =
                            memberStatus === "approved" ||
                            memberStatus === "active";
                          const isPending = memberStatus === "pending";
                          const memberName = member.name ?? "Chưa cập nhật";
                          const memberEmail = member.email ?? "—";
                          const memberRole = translateRole(member.role);
                          const joinedDate = member.joinedDate
                            ? formatDateDisplay(member.joinedDate)
                            : null;

                          return (
                            <div
                              key={
                                member.id ??
                                member.accountId ??
                                `member-${member.email}`
                              }
                              className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 ring-2 ring-border/50 shrink-0">
                                  <AvatarFallback className="text-base font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                                    {memberName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="text-base font-semibold text-foreground truncate">
                                          {memberName}
                                        </p>
                                        {isApproved && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                                          >
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Đã duyệt
                                          </Badge>
                                        )}
                                        {isPending && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                                          >
                                            <Clock className="h-3 w-3 mr-1" />
                                            Chờ duyệt
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                                        {memberEmail}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <User className="h-3.5 w-3.5" />
                                      <span className="font-medium">
                                        {memberRole}
                                      </span>
                                    </div>
                                    {joinedDate && (
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Tham gia: {joinedDate}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border/50 px-8 py-5 bg-muted/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[120px] h-11 font-medium shadow-sm hover:shadow-md transition-all"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {previewImage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setPreviewImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
