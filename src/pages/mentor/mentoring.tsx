import { ProjectDetailDialog } from "@/components/projects/ProjectDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { formatDateDisplay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useMentoringProjectsQuery } from "@/services/project";
import { useProjectDetailQuery } from "@/services/project/hooks";
import type {
  MentoringProjectDto,
  ProjectListItemDto,
  ProjectStatusApi,
} from "@/services/types";
import {
  Activity,
  Eye,
  GraduationCap,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MentorLayout from "./layout";

function getStatusBadge(status: string | null | undefined) {
  const statusLower = (status ?? "").toLowerCase();
  switch (statusLower) {
    case "pending":
      return {
        label: "Chờ duyệt",
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
      };
    case "approved":
    case "inprogress":
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
    case "rejected":
      return {
        label: "Từ chối",
        className:
          "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
      };
    default:
      return {
        label: status ?? "Không xác định",
        className: "bg-muted text-muted-foreground border-border",
      };
  }
}

export default function MentorMentoring() {
  const { data, isLoading, error, isFetching } = useMentoringProjectsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("");
  const [mentoringStatusFilter, setMentoringStatusFilter] =
    useState<string>("");
  const [selectedProject, setSelectedProject] =
    useState<ProjectListItemDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const allProjects = useMemo(() => data?.data ?? [], [data]);

  const statistics = useMemo(() => {
    const total = allProjects.length;
    const active = allProjects.filter(
      (p) => (p.mentoringStatus ?? "").toLowerCase() === "active"
    ).length;
    const totalStudents = allProjects.reduce(
      (sum, p) => sum + (p.totalStudents ?? 0),
      0
    );
    const totalMilestones = allProjects.reduce(
      (sum, p) => sum + (p.totalMilestones ?? 0),
      0
    );
    const completedMilestones = allProjects.reduce(
      (sum, p) => sum + (p.completedMilestones ?? 0),
      0
    );
    const avgProgress =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    return {
      total,
      active,
      totalStudents,
      totalMilestones,
      completedMilestones,
      avgProgress,
    };
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    let filtered = allProjects;

    if (debouncedSearch.trim()) {
      const keyword = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter((project) => {
        const searchFields = [
          project.projectName,
          project.projectDescription,
          project.ownerName,
          project.ownerEmail,
          project.majorName,
          project.projectId ? `PRJ-${project.projectId}` : undefined,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        return searchFields.some((field) => field.includes(keyword));
      });
    }

    if (projectStatusFilter) {
      filtered = filtered.filter((project) => {
        const status = (project.projectStatus ?? "").toLowerCase();
        return status === projectStatusFilter.toLowerCase();
      });
    }

    if (mentoringStatusFilter) {
      filtered = filtered.filter((project) => {
        const status = (project.mentoringStatus ?? "").toLowerCase();
        return status === mentoringStatusFilter.toLowerCase();
      });
    }

    return filtered;
  }, [
    allProjects,
    debouncedSearch,
    projectStatusFilter,
    mentoringStatusFilter,
  ]);

  const paginatedProjects = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredProjects.length);
  }, [filteredProjects.length]);

  useEffect(() => {
    pagination.setPage(1);
  }, [debouncedSearch, projectStatusFilter, mentoringStatusFilter]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || projectStatusFilter || mentoringStatusFilter
  );

  const handleViewProject = (project: MentoringProjectDto) => {
    const projectListItem: ProjectListItemDto = {
      id: project.projectId,
      name: project.projectName ?? null,
      description: project.projectDescription ?? null,
      type: project.projectType ?? null,
      status: project.projectStatus as ProjectStatusApi | null,
      dueDate: project.projectDueDate ?? null,
      ownerId: project.ownerId ?? null,
      ownerName: project.ownerName ?? null,
      ownerEmail: project.ownerEmail ?? null,
      ownerRole: project.ownerRole ?? null,
    };
    setSelectedProject(projectListItem);
    setDetailOpen(true);
  };

  const detailQuery = useProjectDetailQuery(selectedProject?.id ?? null, {
    enabled: detailOpen && Boolean(selectedProject?.id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const columns: DataTableColumn<MentoringProjectDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => {
          const globalIndex =
            (pagination.page - 1) * pagination.pageSize + index + 1;
          return <span className="text-muted-foreground">{globalIndex}</span>;
        },
      },
      {
        id: "project",
        header: "Dự án",
        render: (project) => {
          const projectStatus = getStatusBadge(project.projectStatus);
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-base shrink-0 shadow-sm ring-2 ring-primary/10">
                {(project.projectName ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground line-clamp-1">
                  {project.projectName ?? "Không rõ"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      projectStatus.className
                    )}
                  >
                    {projectStatus.label}
                  </Badge>
                  {project.majorName && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {project.majorName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "owner",
        header: "Trưởng nhóm",
        width: "200px",
        render: (project) => (
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground line-clamp-1">
                {project.ownerName ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {project.ownerEmail ?? "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "students",
        header: "Sinh viên",
        width: "150px",
        render: (project) => {
          const total = project.totalStudents ?? 0;
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-foreground">
                  {total} thành viên
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "milestones",
        header: "Tiến độ",
        width: "150px",
        render: (project) => {
          const total = project.totalMilestones ?? 0;
          const completed = project.completedMilestones ?? 0;
          const progress =
            total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-foreground">
                  {completed}/{total}{" "}
                  <span className="text-xs font-medium text-muted-foreground">
                    ({progress}%)
                  </span>
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "dueDate",
        header: "Hạn nộp",
        width: "120px",
        render: (project) => {
          const dueDate = project.projectDueDate
            ? formatDateDisplay(project.projectDueDate)
            : null;
          return (
            <div className="flex items-center gap-2">
              <span className="text-foreground">{dueDate ?? "—"}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        width: "100px",
        headerClassName: "text-center",
        className: "text-center",
        render: (project) => (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewProject(project)}
            className="h-9 w-9 shadow-sm hover:shadow-md transition-all"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Các nhóm đang mentor
              </h1>
              <p className="text-sm text-muted-foreground">
                Xem danh sách các nhóm dự án mà bạn đang đảm nhận vai trò
                mentor.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              Không thể tải danh sách nhóm đang mentor
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error.message ?? "Vui lòng thử lại sau"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/60 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Tổng số nhóm
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {statistics.total}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Đang mentor
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {statistics.active}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Tổng sinh viên
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {statistics.totalStudents}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-gradient-to-br from-amber-50/50 to-background dark:from-amber-950/20 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Tiến độ trung bình
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {statistics.avgProgress}%
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                      <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSearchTerm(value);
                    }}
                    className="pl-9"
                    placeholder="Tìm theo mã, tên dự án, trưởng nhóm, email..."
                  />
                </div>

                  <Select
                value={projectStatusFilter || "all"}
                onValueChange={(value) =>
                  setProjectStatusFilter(value === "all" ? "" : value)
                }
                  >
                <SelectTrigger id="project-status-filter" className="w-[150px]">
                  <SelectValue placeholder="Trạng thái dự án" />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="inprogress">Đang thực hiện</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                value={mentoringStatusFilter || "all"}
                onValueChange={(value) =>
                  setMentoringStatusFilter(value === "all" ? "" : value)
                }
                  >
                    <SelectTrigger
                      id="mentoring-status-filter"
                      className="w-[150px]"
                    >
                  <SelectValue placeholder="Trạng thái mentor" />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đang mentor</SelectItem>
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                    </SelectContent>
                  </Select>
            </div>

            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={paginatedProjects}
                  isLoading={isLoading}
                  emptyMessage={
                    hasActiveFilters
                      ? "Không tìm thấy nhóm nào phù hợp với bộ lọc"
                      : "Bạn chưa mentor cho nhóm nào"
                  }
                  emptyIcon={
                    <div className="rounded-full bg-muted p-4">
                      <GraduationCap className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                  }
                  keyExtractor={(project, index) =>
                    project.projectId ?? `project-${index}`
                  }
                />
              </CardContent>
            </Card>

            {filteredProjects.length > 0 && (
              <div className="pt-4">
                <TablePagination
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  totalItems={filteredProjects.length}
                  totalPages={pagination.totalPages}
                  startItem={pagination.startItem}
                  endItem={pagination.endItem}
                  hasNext={pagination.hasNext}
                  hasPrevious={pagination.hasPrevious}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  onPrevious={() => pagination.previousPage()}
                  onNext={() => pagination.nextPage()}
                  onPageChange={(p) => pagination.setPage(p)}
                  onPageSizeChange={(s) => pagination.setPageSize(s)}
                />
              </div>
            )}
          </>
        )}

        <ProjectDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          project={selectedProject}
          detail={detailQuery.data ?? null}
          isLoading={detailQuery.isLoading}
          error={detailQuery.error ?? null}
        />
      </div>
    </MentorLayout>
  );
}
