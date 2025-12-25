import { CreateProjectDialog } from "@/components/dean/create-project-dialog";
import { ImportProjectDialog } from "@/components/dean/import-project-dialog";
import { RejectProjectDialog } from "@/components/dean/reject-project-dialog";
import { ProjectDetailDialog } from "@/components/projects/ProjectDetailDialog";
import {
  ProjectsTable,
  statusToLabel,
} from "@/components/projects/ProjectsTable";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useToast } from "@/hooks/use-toast";
import { useAuthAccountStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { useDeanDecisionMutation } from "@/services/council/hooks";
import { useMajorsQuery } from "@/services/major/hooks";
import {
  projectQueryKeys,
  useProjectDetailQuery,
  useProjectsQuery,
  useRejectProjectMutation,
  useUpdateProjectStatusMutation,
} from "@/services/project/hooks";
import type { ProjectListItemDto, ProjectStatusApi } from "@/services/types";
import { useQueryClient } from "@tanstack/react-query";
import { FolderKanban, PlusCircle, Search, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import DeanLayout from "./layout";

type DeanProjectsContentProps = {
  readonly readOnly?: boolean;
};

export function DeanProjectsContent({
  readOnly = false,
}: DeanProjectsContentProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ProjectStatusApi>("");
  const [majorFilter, setMajorFilter] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });
  const { page, pageSize, setTotalItems, setPage, setPageSize } = pagination;

  const account = useAuthAccountStore((state) => state.account);
  const deanMajorId = account?.major?.id;

  const majorsQuery = useMajorsQuery();
  const majors = useMemo(() => majorsQuery.data ?? [], [majorsQuery.data]);

  const { data, isLoading, isFetching } = useProjectsQuery({
    page: Math.max(0, page - 1),
    size: pageSize,
    name: debouncedSearch || undefined,
    status: statusFilter || undefined,
    majorId: majorFilter ? Number(majorFilter) : undefined,
  });

  const projects = useMemo(() => data?.content ?? [], [data?.content]);
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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { toast } = useToast();

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
  const updateStatusMutation = useUpdateProjectStatusMutation({
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(variables.id),
        }),
      ]);
    },
  });
  const rejectProjectMutation = useRejectProjectMutation({
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(variables.id),
        }),
      ]);
      const actionText =
        variables.payload.rejectType === "PERMANENT"
          ? "đã được từ chối"
          : "đã được yêu cầu sửa lại";
      toast({
        title:
          variables.payload.rejectType === "PERMANENT"
            ? "Đã từ chối dự án"
            : "Đã yêu cầu sửa lại",
        description: `${approvalTarget?.name ?? "Dự án"} ${actionText}.`,
      });
      setRejectDialogOpen(false);
      setApprovalTarget(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Xử lý dự án thất bại",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
      });
    },
  });
  const isProcessing =
    decisionMutation.isPending ||
    rejectProjectMutation.isPending ||
    updateStatusMutation.isPending;
  const detailQuery = useProjectDetailQuery(selectedProject?.id ?? null, {
    enabled: detailOpen && Boolean(selectedProject?.id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const filteredProjects = projects;

  // Check if project has same major as dean
  const isDecideDisabled = (project: ProjectListItemDto): boolean => {
    if (!deanMajorId) return false; // If dean has no major, allow decision
    return project.majorId !== deanMajorId;
  };

  const statusFilterOptions = useMemo(() => {
    return [
      { value: "Pending", label: "Đang chờ" },
      { value: "InReview", label: "Đang chấm điểm" },
      { value: "Approved", label: "Đã duyệt" },
      { value: "Rejected", label: "Từ chối" },
      { value: "InProgress", label: "Đang thực hiện" },
      { value: "Completed", label: "Hoàn thành" },
      { value: "Cancelled", label: "Đã hủy" },
      { value: "Archived", label: "Lưu trữ" },
      { value: "RevisionRequired", label: "Yêu cầu sửa đổi" },
      { value: "Scored", label: "Đã chấm điểm" },
    ];
  }, []);

  const handleDecisionSelect = (
    project: ProjectListItemDto,
    decision: "APPROVED" | "REJECTED"
  ) => {
    setApprovalTarget(project);

    // Nếu reject và isCreatedByDean = true, mở dialog reject mới
    if (decision === "REJECTED" && project.isCreatedByDean) {
      setApprovalTarget(project);
      setRejectDialogOpen(true);
    } else {
      setDecisionChoice(decision);
      setConfirmOpen(true);
      setDecisionComment("");
    }
  };

  const handleRejectProject = async (data: {
    readonly rejectType: "REVISION" | "PERMANENT";
    readonly reason?: string | null;
    readonly feedback?: string | null;
    readonly revisionDays?: number | null;
  }) => {
    if (!approvalTarget?.id) {
      toast({
        variant: "destructive",
        title: "Không thể từ chối dự án",
        description: "Thiếu thông tin mã dự án.",
      });
      setRejectDialogOpen(false);
      setApprovalTarget(null);
      return;
    }

    try {
      await rejectProjectMutation.mutateAsync({
        id: approvalTarget.id,
        payload: data,
      });
    } catch (error) {
      // Error đã được xử lý trong onError của mutation
      console.error(error);
    }
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

    try {
      // Dùng API decision cho approve hoặc reject dự án của dean
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
    }
  };

  const isConfirmDisabled = isProcessing || !decisionChoice;
  const isRejecting = decisionChoice === "REJECTED";
  const confirmButtonText = isProcessing
    ? "Đang gửi..."
    : decisionChoice
    ? `${isRejecting ? "Từ chối" : "Duyệt"} dự án`
    : "Gửi quyết định";
  const projectName = approvalTarget?.name ?? "dự án này";

  useEffect(() => {
    setTotalItems(data?.totalElements ?? 0);
  }, [data?.totalElements, setTotalItems]);

  // Reset page to 1 when filters change (but not when page changes)
  const prevFiltersRef = useRef<{
    debouncedSearch: string;
    statusFilter: "" | ProjectStatusApi;
    majorFilter: string;
  } | null>(null);

  useEffect(() => {
    const prevFilters = prevFiltersRef.current;

    // Initialize on first render
    if (prevFilters === null) {
      prevFiltersRef.current = {
        debouncedSearch,
        statusFilter,
        majorFilter,
      };
      return;
    }

    const filtersChanged =
      prevFilters.debouncedSearch !== debouncedSearch ||
      prevFilters.statusFilter !== statusFilter ||
      prevFilters.majorFilter !== majorFilter;

    if (filtersChanged) {
      setPage(1);
      prevFiltersRef.current = {
        debouncedSearch,
        statusFilter,
        majorFilter,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, majorFilter]);

  return (
    <div className="space-y-8">
      <header className="space-y-4 flex justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FolderKanban className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dự án</h1>
              <p className="text-sm text-muted-foreground">
                {readOnly
                  ? "Xem danh sách dự án trong hệ thống"
                  : `Theo dõi danh sách dự án và duyệt những dự án đang ở trạng thái ${statusToLabel(
                      "Pending"
                    )}.`}
              </p>
            </div>
          </div>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setImportOpen(true)}
            >
              <UploadCloud className="h-4 w-4" />
              Import danh sách
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
        )}
      </header>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchTerm(value);
                }}
                className="pl-9"
                placeholder="Tìm theo mã, tên dự án, hoặc trưởng nhóm"
              />
            </div>

            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => {
                setStatusFilter(
                  value === "all" ? "" : (value as ProjectStatusApi)
                );
              }}
            >
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statusFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={majorFilter || "all"}
              onValueChange={(value) => {
                setMajorFilter(value === "all" ? "" : value);
              }}
              disabled={majorsQuery.isLoading}
            >
              <SelectTrigger id="major-filter" className="w-[200px]">
                <SelectValue
                  placeholder={
                    majorsQuery.isLoading
                      ? "Đang tải..."
                      : "Tất cả chuyên ngành"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên ngành</SelectItem>
                {majors
                  .filter((major) => major.isActive !== false)
                  .map((major) => {
                    const majorId = major.id != null ? String(major.id) : null;
                    if (!majorId) return null;
                    return (
                      <SelectItem key={major.id} value={majorId}>
                        {major.name || `Chuyên ngành ${major.id ?? ""}`}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ProjectsTable
        projects={filteredProjects}
        isLoading={isLoading || isFetching}
        onDecide={readOnly ? undefined : handleDecisionSelect}
        approvingId={
          readOnly ? null : isProcessing ? approvalTarget?.id ?? null : null
        }
        onView={handleViewProject}
        isDecideDisabled={readOnly ? () => true : isDecideDisabled}
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

      {!readOnly && (
        <>
          <CreateProjectDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
            }}
          />

          <ImportProjectDialog
            open={importOpen}
            onOpenChange={setImportOpen}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
            }}
          />
        </>
      )}

      {!readOnly && (
        <>
          {/* Dialog reject mới cho dự án được tạo bởi dean */}
          <RejectProjectDialog
            open={rejectDialogOpen}
            onOpenChange={(open) => {
              setRejectDialogOpen(open);
              if (!open) {
                setApprovalTarget(null);
              }
            }}
            project={approvalTarget}
            onReject={handleRejectProject}
            isProcessing={isProcessing}
          />

          {/* Dialog quyết định cũ (cho approve hoặc reject dự án không phải của dean) */}
          <AlertDialog
            open={confirmOpen}
            onOpenChange={(open) => {
              setConfirmOpen(open);
              if (!open) {
                setDecisionComment("");
                setDecisionChoice(null);
                setApprovalTarget(null);
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
                <div className="space-y-2"></div>
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
                <AlertDialogCancel disabled={isProcessing}>
                  Hủy
                </AlertDialogCancel>
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
        </>
      )}

      <ProjectDetailDialog
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
