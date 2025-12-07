import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Flag,
  PlusCircle,
  ShieldAlertIcon,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Eye,
  FileText,
  ExternalLink,
  UserRound,
  Clock4,
  Edit,
} from "lucide-react";
import {
  ProjectSelect,
  type ProjectSelectOption,
} from "@/components/project-select";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import {
  useCreateMilestoneMutation,
  useProjectMilestonesQuery,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
} from "@/services/milestone";
import { useTasksListQuery } from "@/services/task/hooks";
import type {
  MilestoneCreateRequest,
  MilestoneDto,
  MilestoneStatusApi,
} from "@/services/types";
import { useAuthAccountStore } from "@/features/auth/store";
import { formatDateDisplay, formatDateTimeDisplay } from "@/lib/date-utils";

type MilestoneStatusUi =
  | "pending"
  | "in_progress"
  | "completed"
  | "delayed"
  | "cancelled"
  | "unknown";

type MilestoneItem = {
  readonly id: number;
  readonly description: string;
  readonly status: MilestoneStatusUi;
  readonly rawStatus: MilestoneStatusApi | null;
  readonly dueDateRaw: string | null;
  readonly dueDateDisplay: string | null;
  readonly createdAtRaw: string | null;
  readonly createdAtDisplay: string | null;
  readonly progressPercent: number | null;
  readonly projectId: number | null;
  readonly raw: MilestoneDto;
  readonly isFinal: boolean;
};

const statusMeta: Record<
  MilestoneStatusUi,
  { readonly label: string; readonly badge: string }
> = {
  pending: {
    label: "Đang chờ",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  in_progress: {
    label: "Đang xử lý",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
  },
  completed: {
    label: "Hoàn thành",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  delayed: {
    label: "Trễ hạn",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
  cancelled: {
    label: "Đã hủy",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
  },
  unknown: {
    label: "Không xác định",
    badge: "border-muted bg-muted/40 text-muted-foreground",
  },
};

const mapMilestoneStatus = (
  status: MilestoneStatusApi | null
): MilestoneStatusUi => {
  switch (status) {
    case "Pending":
      return "pending";
    case "InProgress":
      return "in_progress";
    case "Completed":
      return "completed";
    case "Delayed":
      return "delayed";
    case "Cancelled":
      return "cancelled";
    default:
      return "unknown";
  }
};

const toMilestoneItem = (milestone: MilestoneDto): MilestoneItem => {
  const description = milestone.description?.trim()
    ? milestone.description.trim()
    : "Milestone chưa có mô tả";

  const dueDateDisplay = formatDateDisplay(milestone.dueDate) ?? null;
  const createdAtDisplay = formatDateTimeDisplay(milestone.createdAt) ?? null;

  const progress =
    typeof milestone.progressPercent === "number" &&
    Number.isFinite(milestone.progressPercent)
      ? Math.min(100, Math.max(0, milestone.progressPercent))
      : null;

  return {
    id: milestone.id,
    description,
    status: mapMilestoneStatus(milestone.status ?? null),
    rawStatus: milestone.status ?? null,
    dueDateRaw: milestone.dueDate ?? null,
    dueDateDisplay,
    createdAtRaw: milestone.createdAt,
    createdAtDisplay,
    progressPercent: progress,
    projectId: milestone.projectId ?? null,
    raw: milestone,
    isFinal: Boolean(milestone.isFinal),
  };
};

const normalizeDueDateForPayload = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("T")) return trimmed;
  return `${trimmed}T00:00:00`;
};

function AdminProgressPage() {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProjectMeta, setSelectedProjectMeta] =
    useState<ProjectSelectOption | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] =
    useState<MilestoneItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draftMilestone, setDraftMilestone] = useState({
    description: "",
    dueDate: "",
    isFinal: false,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({
    description: "",
    dueDate: "",
    status: "Pending",
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const selectTriggerRef = useRef<HTMLButtonElement | null>(null);
  const accountId = useAuthAccountStore((state) => state.account?.id ?? null);
  const accountRoleRaw = useAuthAccountStore(
    (state) => state.account?.role?.roleName ?? state.account?.roleName ?? ""
  );
  const { toast } = useToast();

  const normalizedRole = String(accountRoleRaw ?? "")
    .trim()
    .toLowerCase();
  const adminRoles = [
    "admin",
    "administrator",
    "lecturer",
    "mentor",
    "instructor",
    "teacher",
  ];
  const isTeacher = adminRoles.includes(normalizedRole);

  const openProjectSelector = () => {
    const trigger = selectTriggerRef.current;
    if (trigger) {
      trigger.focus();
      trigger.click();
    }
  };

  const projectId = useMemo(() => {
    const rawId = selectedProjectMeta?.raw?.id;
    if (typeof rawId === "number" && Number.isFinite(rawId)) {
      return rawId;
    }
    const parsed = Number(selectedProjectId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [selectedProjectId, selectedProjectMeta]);

  const {
    data: milestoneData,
    isLoading: milestonesLoading,
    isFetching: milestonesFetching,
    isError: milestonesError,
    error: milestonesErrorDetails,
    refetch: refetchMilestones,
  } = useProjectMilestonesQuery(projectId);

  const taskQueryParams = useMemo(() => {
    if (!projectId) return undefined;
    return {
      projectId,
      page: 1,
      size: 500,
    } as const;
  }, [projectId]);

  const { data: taskListResponse } = useTasksListQuery(taskQueryParams, {
    enabled: projectId != null,
  });

  const milestoneTaskStats = useMemo(() => {
    type TaskStats = {
      total: number;
      done: number;
      pending: number;
      percent: number | null;
    };

    const stats = new Map<number, TaskStats>();
    const taskItems = taskListResponse?.data?.items ?? [];

    for (const task of taskItems) {
      if (
        typeof task.milestoneId !== "number" ||
        !Number.isFinite(task.milestoneId)
      ) {
        continue;
      }

      const milestoneId = task.milestoneId;
      const previous = stats.get(milestoneId) ?? {
        total: 0,
        done: 0,
        pending: 0,
        percent: null,
      };
      const isDone = task.status === "DONE";

      stats.set(milestoneId, {
        total: previous.total + 1,
        done: previous.done + (isDone ? 1 : 0),
        pending: previous.pending + (isDone ? 0 : 1),
        percent: null,
      });
    }

    for (const [milestoneId, value] of stats.entries()) {
      stats.set(milestoneId, {
        ...value,
        percent:
          value.total > 0 ? Math.round((value.done / value.total) * 100) : null,
      });
    }

    return stats;
  }, [taskListResponse]);

  const projectMilestones = useMemo(
    () => (milestoneData ?? []).map(toMilestoneItem),
    [milestoneData]
  );

  useEffect(() => {
    setDetailOpen(false);
    setSelectedMilestone(null);
  }, [projectId]);

  const createMilestoneMutation = useCreateMilestoneMutation({
    onSuccess: (data) => {
      toast({
        title: "Tạo tiến độ thành công",
        description:
          data.description?.trim() || "Tiến độ mới đã được thêm vào dự án.",
      });
      // Refresh milestones list after successful creation
      void refetchMilestones().catch(() => {});
      setCreateOpen(false);
      setDraftMilestone({ description: "", dueDate: "", isFinal: false });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Không thể tạo tiến độ",
        description: error.message || "Vui lòng thử lại sau.",
      });
    },
  });

  const updateMilestoneMutation = useUpdateMilestoneMutation({
    onSuccess: (data) => {
      toast({
        title: "Cập nhật tiến độ",
        description: data.description ?? "Tiến độ đã được cập nhật.",
      });
      setEditOpen(false);
      setSelectedMilestone(data ? toMilestoneItem(data) : null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Không thể cập nhật tiến độ",
        description: error.message || "Vui lòng thử lại sau.",
      });
    },
  });

  const deleteMilestoneMutation = useDeleteMilestoneMutation({
    onSuccess: () => {
      toast({
        title: "Xóa tiến độ",
        description: "Tiến độ đã được xóa.",
      });
      setDeleteConfirmOpen(false);
      setDetailOpen(false);
      setSelectedMilestone(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Không thể xóa tiến độ",
        description: error.message || "Vui lòng thử lại sau.",
      });
    },
  });

  const isRefreshingMilestones =
    Boolean(projectId) && milestonesFetching && !milestonesLoading;

  const isProjectPending = selectedProjectMeta?.status === "Pending";
  const canLoadMilestones = projectId != null;

  const handleOpenMilestone = (milestone: MilestoneItem) => {
    setSelectedMilestone(milestone);
    setDetailOpen(true);
  };

  const sortedMilestones = useMemo(() => {
    return [...projectMilestones].sort((a, b) => {
      const da = a.dueDateRaw ? new Date(a.dueDateRaw).getTime() : Infinity;
      const db = b.dueDateRaw ? new Date(b.dueDateRaw).getTime() : Infinity;
      return da - db;
    });
  }, [projectMilestones]);

  const finalMilestone = useMemo(() => {
    return projectMilestones.find((milestone) => milestone.isFinal) ?? null;
  }, [projectMilestones]);

  const hasFinalMilestone = Boolean(finalMilestone);

  useEffect(() => {
    if (hasFinalMilestone && createOpen) {
      setCreateOpen(false);
    }
  }, [hasFinalMilestone, createOpen]);

  const resetDraft = () =>
    setDraftMilestone({
      description: "",
      dueDate: "",
      isFinal: false,
    });

  const openEditFor = (m: MilestoneItem) => {
    setEditDraft({
      description: m.description,
      dueDate: m.dueDateRaw ?? "",
      status: m.rawStatus ?? "Pending",
    });
    setEditOpen(true);
  };

  const handleUpdateMilestone = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!selectedMilestone) return;
    const payload = {
      description: editDraft.description.trim() || null,
      dueDate: normalizeDueDateForPayload(editDraft.dueDate || ""),
      status: editDraft.status || null,
    } as const;

    updateMilestoneMutation.mutate({
      id: selectedMilestone.id,
      payload,
      projectId: selectedMilestone.projectId ?? undefined,
    });
  };

  const handleDeleteMilestone = () => {
    if (!selectedMilestone) return;
    deleteMilestoneMutation.mutate({
      id: selectedMilestone.id,
      projectId: selectedMilestone.projectId ?? undefined,
    });
  };

  const selectedMilestoneStats = selectedMilestone
    ? milestoneTaskStats.get(selectedMilestone.id) ?? null
    : null;

  const selectedMilestoneProgress =
    selectedMilestoneStats?.percent ??
    selectedMilestone?.progressPercent ??
    null;

  const handleCreateMilestone = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!projectId) {
      toast({
        variant: "destructive",
        title: "Chưa chọn dự án",
        description: "Vui lòng chọn dự án trước khi tạo milestone.",
      });
      return;
    }

    if (isProjectPending) {
      toast({
        variant: "destructive",
        title: "Dự án chưa được phê duyệt",
        description: "Vui lòng đợi dự án được duyệt trước khi tạo milestone.",
      });
      return;
    }

    const description = draftMilestone.description.trim();
    if (!description) {
      toast({
        variant: "destructive",
        title: "Thiếu nội dung milestone",
        description: "Vui lòng nhập mô tả cho milestone.",
      });
      return;
    }

    const dueDatePayload = normalizeDueDateForPayload(draftMilestone.dueDate);

    if (draftMilestone.isFinal && hasFinalMilestone) {
      toast({
        variant: "destructive",
        title: "Đã có final report",
        description:
          "Bạn chỉ có thể tạo duy nhất một final report cho mỗi dự án.",
      });
      return;
    }

    const payload: MilestoneCreateRequest = {
      projectId,
      description,
      ...(dueDatePayload ? { dueDate: dueDatePayload } : {}),
      ...(accountId != null ? { createById: accountId } : {}),
      isFinal: draftMilestone.isFinal,
    };

    createMilestoneMutation.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Quản lý tiến độ</h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi tiến độ (milestone) của các dự án và báo cáo học viên đã
              gửi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <ProjectSelect
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              onProjectChange={setSelectedProjectMeta}
              placeholder="Chọn dự án"
              triggerRef={selectTriggerRef}
              triggerClassName="w-full sm:w-[320px]"
              emptyLabel="Chưa có dự án mentoring nào"
            />
            <div className="space-y-2">
              {isProjectPending ? (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] font-medium text-amber-700">
                  <ShieldAlertIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span className="leading-snug">
                    Dự án đang chờ hội đồng duyệt. Vui lòng đợi phê duyệt trước
                    khi tiếp tục thao tác với milestone.
                  </span>
                </div>
              ) : null}
              {projectId && !isProjectPending ? (
                hasFinalMilestone && finalMilestone ? (
                  <div className="flex items-start gap-3 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-[11px] text-primary">
                    <Flag className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="font-semibold uppercase tracking-wide">
                        Đã có final report
                      </p>
                      <p className="leading-snug">
                        Hạn nộp:{" "}
                        {finalMilestone.dueDateDisplay ?? "Chưa cập nhật"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Chỉ được tạo một final report cho mỗi dự án.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                    Chưa có final report. Bạn có thể đánh dấu khi tạo tiến độ
                    mới.
                  </div>
                )
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isRefreshingMilestones ? (
              <span className="text-xs text-muted-foreground">
                Đang cập nhật...
              </span>
            ) : null}
            {!hasFinalMilestone ? (
              <Button
                type="button"
                className="gap-2"
                onClick={() => setCreateOpen(true)}
                disabled={
                  !canLoadMilestones ||
                  isProjectPending ||
                  createMilestoneMutation.isPending
                }
              >
                <PlusCircle className="h-4 w-4" />
                Tạo tiến độ
              </Button>
            ) : null}
          </div>
        </div>

        {!selectedProjectId && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-md bg-gradient-to-b from-white/60 to-background/40 p-6 text-center">
            <p className="text-sm font-medium">
              Vui lòng chọn dự án trước khi thao tác
            </p>
            <p className="text-xs text-muted-foreground">
              Chọn dự án để xem milestone và thao tác trên bảng.
            </p>
            <div>
              <Button onClick={openProjectSelector}>Chọn dự án</Button>
            </div>
          </div>
        )}

        {canLoadMilestones ? (
          milestonesError ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Không thể tải danh sách milestone.
                </p>
                <p className="text-xs text-muted-foreground">
                  {milestonesErrorDetails?.message ??
                    "Vui lòng thử lại sau ít phút."}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => refetchMilestones()}
              >
                Thử lại
              </Button>
            </div>
          ) : milestonesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-lg border border-border/60 bg-muted/30"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMilestones.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    Chưa có tiến độ nào cho dự án này
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Tạo milestone mới để bắt đầu theo dõi tiến độ
                  </p>
                </div>
              ) : (
                sortedMilestones.map((m, idx) => {
                  const isFinalMilestone = m.isFinal;
                  const hasReportSubmission = Boolean(m.raw.reportSubmittedAt);
                  const stats = milestoneTaskStats.get(m.id);
                  const derivedProgress = stats?.percent ?? null;
                  const progressPercent =
                    derivedProgress ?? m.progressPercent ?? 0;
                  const isOverdue =
                    m.dueDateRaw &&
                    new Date(m.dueDateRaw) < new Date() &&
                    !hasReportSubmission;

                  return (
                    <div key={m.id} className="flex items-start gap-4 group">
                      {/* Timeline marker */}
                      <div className="flex w-12 flex-col items-center pt-1">
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full border-2 transition-all duration-200",
                            hasReportSubmission
                              ? "border-emerald-500 bg-emerald-500 shadow-emerald-200 shadow-md"
                              : isFinalMilestone
                              ? "border-orange-500 bg-orange-500 shadow-orange-200 shadow-md"
                              : "border-primary bg-background group-hover:scale-125 group-hover:border-primary group-hover:bg-primary"
                          )}
                        >
                          {hasReportSubmission && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                          {isFinalMilestone && !hasReportSubmission && (
                            <Flag className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {idx < sortedMilestones.length - 1 && (
                          <div className="flex-1 w-0.5 bg-border/60 mt-2 min-h-[60px] transition-colors duration-200 group-hover:bg-primary/40" />
                        )}
                      </div>

                      {/* Milestone card */}
                      <div
                        className={cn(
                          "flex-1 rounded-xl border bg-card p-5 transition-all duration-200",
                          "hover:shadow-md hover:-translate-y-0.5",
                          hasReportSubmission
                            ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-background"
                            : isFinalMilestone
                            ? "border-orange-200 bg-gradient-to-br from-orange-50/30 to-background"
                            : isOverdue
                            ? "border-red-200 bg-gradient-to-br from-red-50/30 to-background"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground text-base">
                                {m.description}
                              </h3>
                              {isFinalMilestone && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 text-[10px] font-bold uppercase tracking-wider">
                                  Final Report
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{m.dueDateDisplay || "Chưa có hạn"}</span>
                              </div>
                              {isOverdue && (
                                <Badge
                                  variant="outline"
                                  className="border-red-300 bg-red-50 text-red-700 text-[10px]"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Quá hạn
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium",
                                statusMeta[m.status].badge
                              )}
                            >
                              {statusMeta[m.status].label}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {(typeof progressPercent === "number" || stats) && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Tiến độ
                                {stats && (
                                  <span className="text-[10px]">
                                    ({stats.done}/{stats.total} tasks)
                                  </span>
                                )}
                              </span>
                              <span className="font-semibold text-foreground">
                                {progressPercent}%
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        )}

                        {/* Report status */}
                        {hasReportSubmission && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
                            <CheckCircle2 className="h-4 w-4" />
                            <div className="flex-1">
                              <span className="font-medium">
                                Đã nộp báo cáo
                                {m.raw.reportSubmittedAt &&
                                  ` • ${formatDateTimeDisplay(
                                    m.raw.reportSubmittedAt
                                  )}`}
                              </span>
                              {m.raw.reportSubmittedByName && (
                                <p className="text-[10px] text-emerald-600 mt-0.5">
                                  Bởi: {m.raw.reportSubmittedByName}
                                </p>
                              )}
                            </div>
                            {m.raw.reportUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(m.raw.reportUrl!, "_blank");
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Xem
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none"
                            onClick={() => handleOpenMilestone(m)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditFor(m)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Sửa
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )
        ) : selectedProjectId ? (
          <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            Dự án này chưa có mã hợp lệ để đồng bộ milestone.
          </div>
        ) : null}
      </div>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedMilestone(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          {selectedMilestone ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMilestone.description}</DialogTitle>
                <DialogDescription
                  className={cn(
                    selectedMilestone.isFinal && "text-primary font-medium"
                  )}
                >
                  {selectedMilestone.dueDateDisplay
                    ? `Hạn xử lý: ${selectedMilestone.dueDateDisplay}`
                    : "Chưa có hạn xử lý"}
                </DialogDescription>
                {selectedMilestone.isFinal ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Flag className="h-3.5 w-3.5" /> Final report
                  </div>
                ) : null}
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      statusMeta[selectedMilestone.status].badge
                    )}
                  >
                    {statusMeta[selectedMilestone.status].label}
                  </Badge>
                  {selectedMilestone.progressPercent != null ? (
                    <span className="text-xs text-muted-foreground">
                      Tiến độ: {selectedMilestone.progressPercent}%
                    </span>
                  ) : null}
                </div>

                <Separator />

                {/* Report section */}
                {selectedMilestone.raw.reportSubmittedAt && (
                  <>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2">
                          <FileText className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-emerald-900 mb-1">
                            Báo cáo đã nộp
                          </h3>
                          <div className="space-y-1 text-xs text-emerald-700">
                            <div className="flex items-center gap-1.5">
                              <UserRound className="h-3.5 w-3.5" />
                              <span>
                                {selectedMilestone.raw.reportSubmittedByName ||
                                  "Không rõ"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock4 className="h-3.5 w-3.5" />
                              <span>
                                {formatDateTimeDisplay(
                                  selectedMilestone.raw.reportSubmittedAt
                                )}
                              </span>
                            </div>
                          </div>
                          {selectedMilestone.raw.reportComment && (
                            <div className="mt-2 rounded-md bg-white/60 p-2 text-xs text-emerald-800">
                              <p className="font-medium mb-1">Nội dung:</p>
                              <p className="whitespace-pre-wrap">
                                {selectedMilestone.raw.reportComment}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedMilestone.raw.reportUrl && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() =>
                            window.open(
                              selectedMilestone.raw.reportUrl!,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Mở tài liệu báo cáo
                        </Button>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Mô tả</h3>
                  <p className="text-muted-foreground">
                    {selectedMilestone.description}
                  </p>
                </div>

                {selectedMilestoneProgress != null ? (
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">
                      Tiến độ tổng quan
                    </h3>
                    <Progress value={selectedMilestoneProgress} />
                    {selectedMilestoneStats ? (
                      <p className="text-xs text-muted-foreground">
                        Dựa trên task: {selectedMilestoneStats.done}/
                        {selectedMilestoneStats.total} đã hoàn thành
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Task liên kết</h3>
                  {selectedMilestoneStats ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md border border-emerald-200/60 bg-emerald-50/60 px-3 py-2">
                        <p className="text-xs font-medium text-emerald-700">
                          Đã hoàn thành
                        </p>
                        <p className="text-lg font-semibold text-emerald-800">
                          {selectedMilestoneStats.done}
                        </p>
                      </div>
                      <div className="rounded-md border border-amber-200/60 bg-amber-50/60 px-3 py-2">
                        <p className="text-xs font-medium text-amber-700">
                          Chưa hoàn thành
                        </p>
                        <p className="text-lg font-semibold text-amber-800">
                          {selectedMilestoneStats.pending}
                        </p>
                      </div>
                      <div className="col-span-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
                        Tổng số task: {selectedMilestoneStats.total}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có task liên kết với tiến độ này.
                    </p>
                  )}
                </div>

                {selectedMilestone.createdAtDisplay ? (
                  <p className="text-xs text-muted-foreground">
                    Tạo lúc: {selectedMilestone.createdAtDisplay}
                  </p>
                ) : null}

                {selectedMilestone.rawStatus &&
                selectedMilestone.status === "unknown" ? (
                  <p className="text-xs text-muted-foreground">
                    Trạng thái hệ thống: {selectedMilestone.rawStatus}
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <div className="flex items-center justify-end gap-2">
                  {isTeacher ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openEditFor(selectedMilestone)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={deleteMilestoneMutation.isPending}
                      >
                        Xóa
                      </Button>
                    </>
                  ) : null}
                  <Button
                    onClick={() => setDetailOpen(false)}
                    variant="secondary"
                  >
                    Đóng
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit milestone dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open && updateMilestoneMutation.isPending) return;
          setEditOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa tiến độ</DialogTitle>
            <DialogDescription>
              Chỉnh sửa mô tả, hạn và trạng thái.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateMilestone}>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Mô tả</Label>
              <Textarea
                id="edit-desc"
                rows={4}
                value={editDraft.description}
                onChange={(e) =>
                  setEditDraft((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-due">Hạn xử lý</Label>
              <DatePicker
                value={editDraft.dueDate || undefined}
                onChange={(value) =>
                  setEditDraft((p) => ({ ...p, dueDate: value ?? "" }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <select
                id="edit-status"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={editDraft.status}
                onChange={(e) =>
                  setEditDraft((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="Pending">Đang chờ</option>
                <option value="InProgress">Đang xử lý</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Delayed">Trễ hạn</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={updateMilestoneMutation.isPending}
              >
                {updateMilestoneMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditOpen(false)}
                disabled={updateMilestoneMutation.isPending}
              >
                Hủy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa tiến độ vĩnh viễn. Bạn có chắc chắn muốn tiếp
              tục?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteMilestone}
                disabled={deleteMilestoneMutation.isPending}
              >
                {deleteMilestoneMutation.isPending ? "Đang xóa..." : "Xóa"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteMilestoneMutation.isPending}
              >
                Hủy
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open && createMilestoneMutation.isPending) {
            return;
          }
          setCreateOpen(open);
          if (!open) {
            resetDraft();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm tiến độ mới</DialogTitle>
            <DialogDescription>
              Tạo tiến độ để theo dõi công việc mentoring của bạn.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateMilestone}>
            <div className="space-y-2">
              <Label htmlFor="milestone-description">Mô tả</Label>
              <Textarea
                id="milestone-description"
                placeholder="Nội dung chính hoặc tài liệu cần xem xét"
                rows={4}
                value={draftMilestone.description}
                onChange={(event) =>
                  setDraftMilestone((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-due">Hạn xử lý</Label>
              <DatePicker
                value={draftMilestone.dueDate || undefined}
                onChange={(value) =>
                  setDraftMilestone((previous) => ({
                    ...previous,
                    dueDate: value ?? "",
                  }))
                }
                placeholder="Chọn hạn xử lý"
                className={cn(
                  draftMilestone.isFinal &&
                    "border-primary/60 text-primary ring-1 ring-primary/40"
                )}
              />
              {draftMilestone.isFinal ? (
                <p className="text-[11px] font-semibold text-primary">
                  Đây sẽ là hạn final report và được đánh dấu nổi bật với hội
                  đồng.
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Bỏ trống nếu milestone không có hạn cụ thể.
                </p>
              )}
            </div>
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 text-sm">
                  <Label className="text-xs font-semibold uppercase tracking-wide">
                    Đánh dấu final report
                  </Label>
                  {hasFinalMilestone && finalMilestone ? (
                    <p className="text-[11px] text-amber-600">
                      Đã có final report (hạn{" "}
                      {finalMilestone.dueDateDisplay ?? "chưa cập nhật"}).
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Mỗi dự án chỉ có một final report. Bật để đánh dấu tiến độ
                      này.
                    </p>
                  )}
                </div>
                <Switch
                  checked={draftMilestone.isFinal}
                  onCheckedChange={(checked) =>
                    setDraftMilestone((previous) => ({
                      ...previous,
                      isFinal: checked,
                    }))
                  }
                  disabled={hasFinalMilestone || isProjectPending}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="submit"
                disabled={createMilestoneMutation.isPending || isProjectPending}
              >
                {createMilestoneMutation.isPending
                  ? "Đang lưu..."
                  : "Tạo tiến độ"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={createMilestoneMutation.isPending}
                onClick={() => {
                  resetDraft();
                  setCreateOpen(false);
                }}
              >
                Đóng
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminProgressPage;
