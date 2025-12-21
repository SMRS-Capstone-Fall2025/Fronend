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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateDisplay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type {
  ProjectDetailResponseDto,
  ProjectImageInfoDto,
  ProjectListItemDto,
} from "@/services/types";
import {
  ImageIcon,
  Paperclip,
  XCircle,
  Calendar,
  Clock,
  User,
  FileText,
  Folder,
  Image as ImageLucide,
} from "lucide-react";
import { useState } from "react";

function statusToLabel(status: string | null | undefined): string {
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

function statusToBadgeConfig(status: string | null | undefined): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  const normalized = (status ?? "").toString().toLowerCase();
  switch (normalized) {
    case "pending":
      return {
        variant: "secondary",
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
      };
    case "approved":
      return {
        variant: "default",
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
      };
    case "rejected":
      return { variant: "destructive", className: "" };
    case "inprogress":
      return {
        variant: "default",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
      };
    case "completed":
      return {
        variant: "default",
        className:
          "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
      };
    default:
      return { variant: "outline", className: "" };
  }
}

interface ProjectImageThumbProps {
  readonly image: ProjectImageInfoDto;
  readonly alt: string;
}

function ProjectImageThumb({ image, alt }: ProjectImageThumbProps) {
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
    <div className="group relative overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-all">
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
  const status = project?.status ?? detail?.status ?? null;
  const statusLabel = statusToLabel(status);
  const badgeConfig = statusToBadgeConfig(status);

  const createdAt = formatDateDisplay(detail?.createDate ?? "—");
  const dueDate = formatDateDisplay(detail?.dueDate ?? project?.dueDate) ?? "—";
  const description = detail?.description ?? "Không có mô tả.";
  const ownerName = detail?.owner?.name ?? project?.ownerName ?? "Không rõ";
  const ownerEmail = detail?.owner?.email ?? "—";

  const files = detail?.files ?? [];
  const images = detail?.images ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Enhanced Header with Gradient */}
        <DialogHeader className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-background border-b px-6 py-6">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-4 ring-primary/5">
                  <Folder className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {project?.name ?? "Chi tiết dự án"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm font-medium flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-mono">
                      <FileText className="h-3 w-3" />
                      {project?.id ? `PRJ-${project.id}` : "—"}
                    </span>
                    {detail?.type && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {detail.type}
                        </span>
                      </>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </div>
            <Badge
              variant={badgeConfig.variant}
              className={cn(
                "capitalize shrink-0 text-sm px-3 py-1.5 font-semibold shadow-sm",
                badgeConfig.className
              )}
            >
              {statusLabel}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 py-6">
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
              <>
                {/* Info Cards Grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Created Date Card */}
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

                  {/* Due Date Card */}
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

                  {/* Project Type Card */}
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

                {/* Owner Card */}
                <section className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
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

                {/* Description Card */}
                <section className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Mô tả dự án
                    </h3>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="whitespace-pre-line text-sm text-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </section>

                {/* Files Section */}
                <section className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">
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
                            key={file.id ?? file.filePath ?? `file-${index}`}
                            className="group flex items-center gap-3 rounded-lg border bg-background/50 px-4 py-3 hover:bg-background hover:shadow-sm transition-all"
                          >
                            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-2.5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                              <Paperclip className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {file.filePath ?? "Không rõ đường dẫn"}
                              </p>
                              {file.type ? (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {file.type}
                                </p>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </section>

                {/* Images Section */}
                <section className="rounded-xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ImageLucide className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">
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
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[120px]"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
