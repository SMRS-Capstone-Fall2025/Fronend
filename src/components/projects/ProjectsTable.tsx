import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateDisplay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { ProjectListItemDto } from "@/services/types";
import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Search,
  Users2,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

function isPendingStatus(status: string | null | undefined): boolean {
  return (status ?? "").toString().toLowerCase() === "pending";
}

function isInactiveStatus(status: string | null | undefined): boolean {
  const statusLower = (status ?? "").toString().toLowerCase();
  return statusLower === "cancelled" || statusLower === "archived";
}

export function statusToLabel(status: string | null | undefined): string {
  switch ((status ?? "").split("_").join("").toLowerCase()) {
    case "pending":
      return "Đang chờ";
    case "inreview":
      return "Đang chấm điểm";
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
    case "archived":
      return "Lưu trữ";
    case "revisionrequired":
      return "Yêu cầu sửa đổi";
    case "scored":
      return "Đã chấm điểm";
    default:
      return status ?? "Không rõ";
  }
}

export function statusToBadgeConfig(status: string | null | undefined): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  const normalized = (status ?? "")
    .toString()
    .split("_")
    .join("")
    .toLowerCase();
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
    case "archived":
      return {
        variant: "outline",
        className:
          "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
      };
    case "inreview":
      return {
        variant: "secondary",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
      };
    case "cancelled":
      return {
        variant: "outline",
        className:
          "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400",
      };
    case "revisionrequired":
      return {
        variant: "outline",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
      };
    case "scored":
      return {
        variant: "default",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
      };

    default:
      return { variant: "outline", className: "" };
  }
}

interface ProjectsTableProps {
  readonly projects: ProjectListItemDto[];
  readonly isLoading?: boolean;
  readonly onDecide?: (
    project: ProjectListItemDto,
    decision: "APPROVED" | "REJECTED"
  ) => void;
  readonly approvingId?: number | null;
  readonly onView: (project: ProjectListItemDto) => void;
  readonly onAssignCouncil?: (project: ProjectListItemDto) => void;
  readonly onViewCouncil?: (
    project: ProjectListItemDto,
    councilId: number
  ) => void;
  readonly getProjectCouncilId?: (
    project: ProjectListItemDto
  ) => number | null | undefined;
  readonly isDecideDisabled?: (project: ProjectListItemDto) => boolean;
  readonly isAssignCouncilDisabled?: (project: ProjectListItemDto) => boolean;
}

export function ProjectsTable({
  projects,
  isLoading,
  onDecide,
  approvingId,
  onView,
  onAssignCouncil,
  onViewCouncil,
  getProjectCouncilId,
  isDecideDisabled,
  isAssignCouncilDisabled,
}: ProjectsTableProps) {
  const columns: DataTableColumn<ProjectListItemDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => (
          <span className="text-muted-foreground">{index + 1}</span>
        ),
      },
      {
        id: "code",
        header: "Mã",
        width: "100px",
        render: (project) => (
          <span className="text-xs font-medium text-muted-foreground">
            {project.id ? `PRJ-${project.id}` : "—"}
          </span>
        ),
      },
      {
        id: "name",
        header: "Tên dự án",
        render: (project) => (
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
        ),
      },
      {
        id: "owner",
        header: "Trưởng nhóm",
        width: "180px",
        render: (project) => {
          const owner = project.ownerName ?? "—";
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground font-medium text-xs shrink-0">
                {owner.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-foreground line-clamp-1">
                {owner}
              </span>
            </div>
          );
        },
      },
      {
        id: "dueDate",
        header: "Hạn chót",
        width: "120px",
        render: (project) => (
          <span className="text-sm">
            {formatDateDisplay(project.dueDate) ?? "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        width: "130px",
        render: (project) => {
          const badgeConfig = statusToBadgeConfig(project.status);
          return (
            <Badge
              variant={badgeConfig.variant}
              className={cn(
                "capitalize whitespace-nowrap text-xs",
                badgeConfig.className
              )}
            >
              {statusToLabel(project.status)}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        headerClassName: "text-right",
        className: "text-right",
        width: "120px",
        render: (project) => {
          const pending = isPendingStatus(project.status);
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(project);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs">Xem</span>
              </Button>
              {(() => {
                const councilId = getProjectCouncilId?.(project);
                if (councilId && onViewCouncil) {
                  return (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCouncil(project, councilId);
                      }}
                    >
                      <Users2 className="h-3.5 w-3.5" />
                      <span className="text-xs">Xem hội đồng</span>
                    </Button>
                  );
                }
                if (onAssignCouncil) {
                  const isInactive = isInactiveStatus(project.status);
                  const isDisabled =
                    isInactive || isAssignCouncilDisabled?.(project);
                  return (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-8 gap-1.5"
                      disabled={isDisabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignCouncil(project);
                      }}
                    >
                      <Users2 className="h-3.5 w-3.5" />
                      <span className="text-xs">Gắn hội đồng</span>
                    </Button>
                  );
                }
                return null;
              })()}
              {pending && project.id && onDecide ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5"
                      disabled={
                        approvingId === project.id ||
                        isDecideDisabled?.(project)
                      }
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                      <span className="text-xs">Thao tác</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => onDecide(project, "APPROVED")}
                      className="gap-2 cursor-pointer"
                      disabled={isDecideDisabled?.(project)}
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Duyệt dự án</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDecide(project, "REJECTED")}
                      className="gap-2 cursor-pointer"
                      disabled={isDecideDisabled?.(project)}
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>Từ chối dự án</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          );
        },
      },
    ],
    [
      onDecide,
      onView,
      onAssignCouncil,
      onViewCouncil,
      approvingId,
      isDecideDisabled,
      isAssignCouncilDisabled,
      getProjectCouncilId,
    ]
  );

  return (
    <DataTable
      columns={columns}
      data={projects}
      isLoading={isLoading}
      emptyMessage="Không tìm thấy dự án nào"
      emptyIcon={
        <div className="rounded-full bg-muted p-4">
          <Search className="h-8 w-8 text-muted-foreground/60" />
        </div>
      }
      keyExtractor={(project, index) =>
        project.id ?? project.name ?? `project-${index}`
      }
    />
  );
}
