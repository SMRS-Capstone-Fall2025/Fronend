import { CreateProjectDialog } from "@/components/dean/create-project-dialog";
import { ImportProjectDialog } from "@/components/dean/import-project-dialog";
import { ProjectDetailDialog } from "@/components/projects/ProjectDetailDialog";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useAssignCouncilMutation,
  useCouncilListQuery,
  useDeanDecisionMutation,
} from "@/services/council/hooks";
import {
  projectQueryKeys,
  useProjectDetailQuery,
  useProjectsQuery,
} from "@/services/project/hooks";
import type { ProjectListItemDto } from "@/services/types";
import { useQueryClient } from "@tanstack/react-query";
import { PlusCircle, UploadCloud, X, Search, FolderKanban } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DeanLayout from "./layout";

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
  const [selectedCouncilId, setSelectedCouncilId] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { toast } = useToast();

  const councilsQuery = useCouncilListQuery();
  const councils = useMemo(
    () => councilsQuery.data ?? [],
    [councilsQuery.data]
  );
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
  const isProcessing = assignMutation.isPending || decisionMutation.isPending;
  const detailQuery = useProjectDetailQuery(selectedProject?.id ?? null, {
    enabled: detailOpen && Boolean(selectedProject?.id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

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
    if (!debouncedSearch.trim()) return projects;
    const keyword = debouncedSearch.trim().toLowerCase();
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
  }, [projects, debouncedSearch]);

  const hasActiveFilters = Boolean(searchTerm.trim());

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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FolderKanban className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dự án</h1>
              <p className="text-sm text-muted-foreground">
                Theo dõi danh sách dự án và duyệt những dự án đang ở trạng thái{" "}
                {statusToLabel("Pending")}.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
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
      </div>

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
