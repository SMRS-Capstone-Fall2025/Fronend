import {
  CouncilDetailsDialog,
  councilStatusPresentation,
} from "@/components/dean/council-details-dialog";
import { CouncilUpsertDialog } from "@/components/dean/council-upsert-dialog";
import { ProjectDetailDialog } from "@/components/projects/ProjectDetailDialog";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
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
import { useToast } from "@/hooks/use-toast";
import { useAuthAccountStore } from "@/lib/auth-store";
import { cn, getErrorMessage } from "@/lib/utils";
import type { CouncilFormValues } from "@/lib/validations/council";
import {
  useAssignCouncilMutation,
  useCouncilDetailQuery,
  useCouncilListQuery,
  useCreateCouncilWithProjectMutation,
} from "@/services/council/hooks";
import {
  projectQueryKeys,
  useProjectDetailQuery,
  useProjectsReadyForCouncilQuery,
} from "@/services/project/hooks";
import type { ProjectListItemDto } from "@/services/types";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DeanLayout from "./layout";

export default function ProjectsReadyForCouncil() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCouncilIdForAssign, setSelectedCouncilIdForAssign] =
    useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });
  const { page, pageSize, setTotalItems, setPage } = pagination;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const account = useAuthAccountStore((state) => state.account);
  const deanMajorId = account?.major?.id;

  // Get projects ready for council
  const {
    data: projectsData,
    isLoading,
    isFetching,
  } = useProjectsReadyForCouncilQuery();

  // Get councils list
  const { data: councils = [], isLoading: isLoadingCouncils } =
    useCouncilListQuery();

  // Map API response to ProjectListItemDto format with council info
  const projects = useMemo(() => {
    const rawProjects = projectsData?.data ?? [];
    const mapped = rawProjects.map((p) => ({
      id: p.projectId,
      name: p.projectName,
      description: p.projectDescription,
      type: p.projectType,
      dueDate: p.projectDueDate,
      ownerId: p.ownerId,
      ownerName: p.ownerName,
      ownerEmail: p.ownerEmail,
      ownerRole: p.ownerRole,
      status: p.projectStatus as ProjectListItemDto["status"],
      hasFinalReport: p.hasFinalReport,
      majorId: p.majorId,
      // Store council info for later use
      _councilInfo: p.alreadyAssignedToCouncil
        ? {
            councilId: p.assignedCouncilId,
            councilName: p.assignedCouncilName,
            councilCode: p.assignedCouncilCode,
          }
        : null,
    })) as (ProjectListItemDto & {
      majorId?: number | null;
      _councilInfo?: {
        councilId: number | null;
        councilName: string | null;
        councilCode: string | null;
      } | null;
    })[];

    // Sort by projectDueDate (newest first - descending)
    // Projects without due dates go to the end
    return mapped.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
      return dateB - dateA; // Descending order (newest first)
    });
  }, [projectsData, deanMajorId]);

  // Filter projects by search
  const filteredProjects = useMemo(() => {
    if (!debouncedSearch.trim()) return projects;
    const searchLower = debouncedSearch.trim().toLowerCase();
    return projects.filter(
      (project) =>
        project.name?.toLowerCase().includes(searchLower) ||
        project.ownerName?.toLowerCase().includes(searchLower) ||
        project.ownerEmail?.toLowerCase().includes(searchLower) ||
        project.type?.toLowerCase().includes(searchLower)
    );
  }, [projects, debouncedSearch]);

  // Paginate filtered projects
  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, page, pageSize]);

  const [selectedProject, setSelectedProject] =
    useState<ProjectListItemDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ProjectListItemDto | null>(
    null
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [viewCouncilId, setViewCouncilId] = useState<number | null>(null);
  const [councilDetailOpen, setCouncilDetailOpen] = useState(false);
  const [createCouncilDialogOpen, setCreateCouncilDialogOpen] = useState(false);

  // Query council detail when viewing
  const councilDetailQuery = useCouncilDetailQuery(
    councilDetailOpen ? viewCouncilId : null
  );

  const assignMutation = useAssignCouncilMutation({
    onSuccess: async (_, variables) => {
      toast({
        title: "Đã gắn hội đồng",
        description: "Dự án đã được gắn hội đồng thành công.",
      });
      setAssignDialogOpen(false);
      setAssignTarget(null);
      setSelectedCouncilIdForAssign("");
      await queryClient.invalidateQueries({
        queryKey: projectQueryKeys.readyForCouncil(),
      });
      await queryClient.invalidateQueries({
        queryKey: projectQueryKeys.detail(variables.projectId),
      });
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Vui lòng thử lại sau.");
      toast({
        variant: "destructive",
        title: "Gắn hội đồng thất bại",
        description: errorMessage,
      });
    },
  });

  const createCouncilWithProjectMutation = useCreateCouncilWithProjectMutation({
    onSuccess: async () => {
      toast({
        title: "Đã tạo và gắn hội đồng",
        description: "Hội đồng mới đã được tạo và gắn cho dự án thành công.",
      });
      setCreateCouncilDialogOpen(false);
      setAssignDialogOpen(false);
      setAssignTarget(null);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Vui lòng thử lại sau.");
      toast({
        variant: "destructive",
        title: "Tạo hội đồng thất bại",
        description: errorMessage,
      });
    },
  });

  const detailQuery = useProjectDetailQuery(selectedProject?.id ?? null, {
    enabled: detailOpen && Boolean(selectedProject?.id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setTotalItems(filteredProjects.length);
  }, [filteredProjects.length, setTotalItems]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, setPage]);

  const handleViewProject = (project: ProjectListItemDto) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const handleAssignCouncil = (project: ProjectListItemDto) => {
    // Check if action is disabled before proceeding
    if (isActionDisabled(project)) {
      toast({
        variant: "destructive",
        title: "Không thể thực hiện",
        description: "Chỉ có thể gắn hội đồng cho dự án cùng chuyên ngành.",
      });
      return;
    }
    setAssignTarget(project);
    setAssignDialogOpen(true);
    setSelectedCouncilIdForAssign("");
  };

  const handleViewCouncil = (
    _project: ProjectListItemDto,
    councilId: number
  ) => {
    setViewCouncilId(councilId);
    setCouncilDetailOpen(true);
  };

  const getProjectCouncilId = (project: ProjectListItemDto) => {
    const rawProject = projectsData?.data?.find(
      (p) => p.projectId === project.id
    );
    return rawProject?.alreadyAssignedToCouncil
      ? rawProject.assignedCouncilId ?? null
      : null;
  };

  // Check if actions should be disabled (only allow actions if major matches)
  const isActionDisabled = (project: ProjectListItemDto) => {
    if (!deanMajorId) return true; // If dean has no major, disable all actions
    const projectMajorId = (
      project as ProjectListItemDto & { majorId?: number | null }
    ).majorId;
    return projectMajorId !== deanMajorId; // Disable if major doesn't match
  };

  const handleConfirmAssign = async () => {
    if (!assignTarget?.id) {
      toast({
        variant: "destructive",
        title: "Không thể gắn hội đồng",
        description: "Thiếu thông tin mã dự án.",
      });
      return;
    }

    if (!selectedCouncilIdForAssign) {
      toast({
        variant: "destructive",
        title: "Chưa chọn hội đồng",
        description: "Vui lòng chọn hội đồng trước khi gửi.",
      });
      return;
    }

    try {
      await assignMutation.mutateAsync({
        projectId: assignTarget.id,
        councilId: Number(selectedCouncilIdForAssign),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCouncil = () => {
    setCreateCouncilDialogOpen(true);
  };

  const handleCreateCouncilSubmit = async (values: CouncilFormValues) => {
    if (!assignTarget?.id) {
      toast({
        variant: "destructive",
        title: "Không thể tạo hội đồng",
        description: "Thiếu thông tin mã dự án.",
      });
      return;
    }

    try {
      await createCouncilWithProjectMutation.mutateAsync({
        projectId: assignTarget.id,
        councilCode: values.councilCode,
        councilName: values.councilName,
        department: values.department || null,
        description: values.description || null,
        lecturerEmails: values.lecturerEmails,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DeanLayout>
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Users2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Quản lý báo cáo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Quản lý và gắn hội đồng cho các dự án đã sẵn sàng.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              placeholder="Tìm theo tên dự án, chủ dự án..."
            />
          </div>
        </div>

        <ProjectsTable
          projects={paginatedProjects}
          isLoading={isLoading || isFetching}
          onView={handleViewProject}
          onAssignCouncil={handleAssignCouncil}
          onViewCouncil={handleViewCouncil}
          getProjectCouncilId={getProjectCouncilId}
          isAssignCouncilDisabled={isActionDisabled}
        />

        {filteredProjects.length > 0 && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            hasNext={pagination.hasNext}
            hasPrevious={pagination.hasPrevious}
            isLoading={isLoading || isFetching}
            onPrevious={pagination.previousPage}
            onNext={pagination.nextPage}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        )}

        <ProjectDetailDialog
          open={detailOpen}
          project={selectedProject}
          detail={detailQuery?.data ?? null}
          error={detailQuery?.error ?? null}
          isLoading={detailQuery.isLoading}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) {
              setSelectedProject(null);
            }
          }}
        />

        {/* Assign Council Dialog */}
        <Dialog
          open={assignDialogOpen}
          onOpenChange={(open) => {
            setAssignDialogOpen(open);
            if (!open) {
              setAssignTarget(null);
              setSelectedCouncilIdForAssign("");
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gắn hội đồng</DialogTitle>
              <DialogDescription>
                Chọn hội đồng để gắn cho dự án{" "}
                <span className="font-medium">
                  {assignTarget?.name ?? "này"}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={selectedCouncilIdForAssign}
                onValueChange={setSelectedCouncilIdForAssign}
                disabled={isLoadingCouncils || assignMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hội đồng" />
                </SelectTrigger>
                <SelectContent>
                  {councils.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Không có hội đồng nào
                    </div>
                  ) : (
                    councils.map((council) => {
                      const isInactive =
                        council.status?.toLowerCase() === "inactive";
                      const statusConfig = councilStatusPresentation(
                        council.status
                      );
                      return (
                        <SelectItem
                          key={council.id}
                          value={council.id?.toString() ?? ""}
                          disabled={isInactive}
                          className="*:w-full"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-left text-sm leading-tight">
                                {council.councilName ??
                                  `Hội đồng #${council.id}`}
                              </div>
                              {council.department && (
                                <div className="text-xs text-muted-foreground truncate leading-tight">
                                  {council.department}
                                </div>
                              )}
                            </div>
                            <Badge
                              variant={statusConfig.variant}
                              className={cn(
                                "shrink-0 text-xs",
                                statusConfig.className
                              )}
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">hoặc</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCreateCouncil}
                disabled={
                  assignMutation.isPending ||
                  Boolean(
                    assignTarget?.status &&
                      (assignTarget.status.toLowerCase() === "cancelled" ||
                        assignTarget.status.toLowerCase() === "archived")
                  )
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo hội đồng mới
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAssignDialogOpen(false);
                  setAssignTarget(null);
                  setSelectedCouncilIdForAssign("");
                }}
                disabled={assignMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmAssign}
                disabled={
                  !selectedCouncilIdForAssign ||
                  assignMutation.isPending ||
                  Boolean(
                    assignTarget?.status &&
                      (assignTarget.status.toLowerCase() === "cancelled" ||
                        assignTarget.status.toLowerCase() === "archived")
                  )
                }
              >
                {assignMutation.isPending ? "Đang gửi..." : "Gắn hội đồng"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CouncilDetailsDialog
          open={councilDetailOpen}
          council={councilDetailQuery.data ?? undefined}
          isLoading={councilDetailQuery.isLoading}
          onOpenChange={(open) => {
            setCouncilDetailOpen(open);
            if (!open) {
              setViewCouncilId(null);
            }
          }}
        />

        <CouncilUpsertDialog
          open={createCouncilDialogOpen}
          mode="create"
          submitting={createCouncilWithProjectMutation.isPending}
          onSubmit={handleCreateCouncilSubmit}
          onOpenChange={(open) => {
            setCreateCouncilDialogOpen(open);
          }}
        />
      </div>
    </DeanLayout>
  );
}
