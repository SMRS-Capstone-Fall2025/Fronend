import type { ProjectListItemDto } from "@/services/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreHorizontal,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDateDisplay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

function isPendingStatus(status: string | null | undefined): boolean {
  return (status ?? "").toString().toLowerCase() === "pending";
}

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

interface ProjectsTableProps {
  readonly projects: ProjectListItemDto[];
  readonly isLoading?: boolean;
  readonly onDecide: (
    project: ProjectListItemDto,
    decision: "APPROVED" | "REJECTED"
  ) => void;
  readonly approvingId?: number | null;
  readonly onView: (project: ProjectListItemDto) => void;
}

export function ProjectsTable({
  projects,
  isLoading,
  onDecide,
  approvingId,
  onView,
}: ProjectsTableProps) {
  const loadingRows = Array.from({ length: 5 }, (_, index) => index);

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[100px] font-semibold">Mã</TableHead>
            <TableHead className="font-semibold">Tên dự án</TableHead>
            <TableHead className="w-[140px] font-semibold">Loại</TableHead>
            <TableHead className="w-[180px] font-semibold">Chủ nhiệm</TableHead>
            <TableHead className="w-[120px] font-semibold">Hạn chót</TableHead>
            <TableHead className="w-[130px] font-semibold">
              Trạng thái
            </TableHead>
            <TableHead className="w-[120px] text-right font-semibold">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            loadingRows.map((index) => (
              <TableRow key={`pending-project-loading-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
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
              <TableCell colSpan={7} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-muted p-4">
                    <Search className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Không tìm thấy dự án nào
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Thử thay đổi bộ lọc hoặc tìm kiếm
                    </p>
                  </div>
                </div>
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
                <TableRow
                  key={rowKey}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                    {project.id ? `PRJ-${project.id}` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm shrink-0">
                        {(project.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground line-clamp-1">
                          {project.name ?? "Không rõ"}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {project.type ?? "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.type ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground font-medium text-xs shrink-0">
                        {owner.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-foreground line-clamp-1">
                        {owner}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{dueDateLabel}</TableCell>
                  <TableCell>
                    <Badge
                      variant={badgeConfig.variant}
                      className={cn(
                        "capitalize whitespace-nowrap text-xs",
                        badgeConfig.className
                      )}
                    >
                      {statusToLabel(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onView(project)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-xs">Xem</span>
                      </Button>
                      {pending && project.id ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={approvingId === project.id}
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                              <span className="text-xs">Thao tác</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => onDecide(project, "APPROVED")}
                              className="gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              <span>Duyệt dự án</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDecide(project, "REJECTED")}
                              className="gap-2 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span>Từ chối dự án</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
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
