import { type ProjectSelectOption } from "@/components/project-select";
import { ProjectSelectCard } from "@/components/projects/project-select-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthAccountStore } from "@/lib/auth-store";
import { formatDateDisplay, formatDateTimeDisplay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  type CreateMilestoneFormValues,
  type UpdateMilestoneFormValues,
} from "@/lib/validations/milestone";
import {
  useCreateMilestoneMutation,
  useDeleteMilestoneMutation,
  useProjectMilestonesQuery,
  useUpdateMilestoneMutation,
} from "@/services/milestone";
import { useTasksListQuery } from "@/services/task/hooks";
import type {
  MilestoneCreateRequest,
  MilestoneDto,
  MilestoneStatusApi,
} from "@/services/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock4,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  Milestone,
  PlusCircle,
  ShieldAlertIcon,
  Trash2,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import MentorLayout from "./layout";

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

export default function MentorProgress() {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProjectMeta, setSelectedProjectMeta] =
    useState<ProjectSelectOption | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] =
    useState<MilestoneItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const createForm = useForm<CreateMilestoneFormValues>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      description: "",
      dueDate: "",
      isFinal: false,
    },
  });

  const selectTriggerRef = useRef<HTMLButtonElement | null>(null);
  const accountId = useAuthAccountStore((state) => state.account?.id ?? null);
  const accountRoleRaw = useAuthAccountStore(
    (state) => state.account?.role ?? ""
  );
  const { toast } = useToast();

  const normalizedRole = String(accountRoleRaw ?? "")
    .trim()
    .toLowerCase();
  const teacherRoles = ["lecturer", "mentor", "instructor", "teacher"];
  const isTeacher = teacherRoles.includes(normalizedRole);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: milestonesErrorDetails,
    refetch: refetchMilestones,
  } = useProjectMilestonesQuery(projectId, {
    refetchOnMount: "always",
  });

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
    refetchOnMount: "always",
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

      void refetchMilestones().catch(() => {});
      setCreateOpen(false);
      createForm.reset({ description: "", dueDate: "", isFinal: false });
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
    onSuccess: async () => {
      toast({
        title: "Xóa tiến độ",
        description: "Tiến độ đã được xóa.",
      });
      setDeleteConfirmOpen(false);
      setDetailOpen(false);
      setSelectedMilestone(null);

      await refetchMilestones();
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

  const resetDraft = () => {
    createForm.reset({
      description: "",
      dueDate: "",
      isFinal: false,
    });
  };

  const [editOpen, setEditOpen] = useState(false);

  const updateForm = useForm<UpdateMilestoneFormValues>({
    resolver: zodResolver(updateMilestoneSchema),
    defaultValues: {
      description: "",
      dueDate: "",
      status: "Pending",
    },
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const openEditFor = (m: MilestoneItem) => {
    updateForm.reset({
      description: m.description,
      dueDate: m.dueDateRaw ?? "",
      status: (m.rawStatus ?? "Pending") as
        | "Pending"
        | "InProgress"
        | "Completed"
        | "Delayed"
        | "Cancelled",
    });
    setEditOpen(true);
  };

  const handleUpdateMilestone = updateForm.handleSubmit((data) => {
    if (!selectedMilestone) return;
    const payload = {
      description: data.description.trim() || null,
      dueDate: normalizeDueDateForPayload(data.dueDate || ""),
      status: data.status || null,
    } as const;

    updateMilestoneMutation.mutate({
      id: selectedMilestone.id,
      payload,
      projectId: selectedMilestone.projectId ?? undefined,
    });
  });

  const checkHasReportSubmission = (
    milestone: MilestoneItem | null
  ): boolean => {
    if (!milestone) return false;
    return Boolean(milestone.raw.reportSubmittedAt || milestone.raw.reportUrl);
  };

  const handleDeleteMilestone = () => {
    if (!selectedMilestone) return;

    if (checkHasReportSubmission(selectedMilestone)) {
      toast({
        variant: "destructive",
        title: "Không thể xóa tiến độ",
        description: "Không thể xóa tiến độ đã nộp báo cáo.",
      });
      setDeleteConfirmOpen(false);
      return;
    }

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

  const handleCreateMilestone = createForm.handleSubmit((data) => {
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

    if (data.isFinal && hasFinalMilestone) {
      toast({
        variant: "destructive",
        title: "Đã có final report",
        description:
          "Bạn chỉ có thể tạo duy nhất một final report cho mỗi dự án.",
      });
      return;
    }

    const dueDatePayload = normalizeDueDateForPayload(data.dueDate || "");

    const payload: MilestoneCreateRequest = {
      projectId,
      description: data.description.trim(),
      ...(dueDatePayload ? { dueDate: dueDatePayload } : {}),
      ...(accountId != null ? { createById: accountId } : {}),
      isFinal: data.isFinal,
    };

    createMilestoneMutation.mutate(payload);
  });

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Flag className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Quản lý tiến độ
              </h1>
              <p className="text-sm text-muted-foreground">
                Theo dõi tiến độ (milestone) của các dự án và báo cáo học viên
                đã gửi.
              </p>
            </div>
          </div>
        </div>

        <ProjectSelectCard
          selectedProjectId={selectedProjectId}
          onValueChange={setSelectedProjectId}
          onProjectChange={setSelectedProjectMeta}
          selectedProject={selectedProjectMeta}
          title="Chọn dự án"
          description="Chọn dự án để xem và quản lý tiến độ"
          placeholder="Chọn dự án"
          icon={Milestone}
          triggerRef={selectTriggerRef}
          actionButtons={
            <>
              {isRefreshingMilestones ? (
                <span className="text-xs text-muted-foreground">
                  Đang cập nhật...
                </span>
              ) : null}
              <Button
                type="button"
                className="gap-2"
                onClick={() => setCreateOpen(true)}
                disabled={
                  hasFinalMilestone ||
                  !canLoadMilestones ||
                  isProjectPending ||
                  createMilestoneMutation.isPending ||
                  !selectedProjectId
                }
              >
                <PlusCircle className="h-4 w-4" />
                Tạo tiến độ
              </Button>
            </>
          }
        />

        <div className="space-y-2">
          {isProjectPending ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] font-medium text-amber-700">
              <ShieldAlertIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span className="leading-snug">
                Dự án đang chờ hội đồng duyệt. Vui lòng đợi phê duyệt trước khi
                tiếp tục thao tác với milestone.
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
                    Hạn nộp: {finalMilestone.dueDateDisplay ?? "Chưa cập nhật"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Chỉ được tạo một final report cho mỗi dự án.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                Chưa có final report. Bạn có thể đánh dấu khi tạo tiến độ mới.
              </div>
            )
          ) : null}
        </div>

        <Card className="mt-6">
          <CardContent className="relative min-h-[200px] pt-6">
            {!selectedProjectId && (
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-50/80 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/50 p-8 text-center backdrop-blur-sm border-2 border-dashed border-border/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Milestone className="h-8 w-8 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    Vui lòng chọn dự án trước khi thao tác
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Chọn dự án từ danh sách ở trên để xem tiến độ
                  </p>
                </div>
              </div>
            )}

            {milestonesError ? (
              <div className="text-sm text-destructive">
                Không thể tải tiến độ.
              </div>
            ) : null}
            {!milestonesError && milestonesLoading && (
              <div className="space-y-2">
                <div className="h-20 animate-pulse rounded-lg border border-border/60 bg-muted/30" />
              </div>
            )}
            {!milestonesError && !milestonesLoading && (
              <div className="space-y-3">
                {sortedMilestones.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border/60 bg-gradient-to-br from-slate-50/50 to-muted/20 dark:from-slate-900/30 dark:to-slate-800/20 p-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      Chưa có tiến độ cho dự án này
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tạo milestone mới để bắt đầu theo dõi tiến độ
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedMilestones.map((m, idx) => {
                      const isFinalMilestone = m.isFinal;
                      const hasReportSubmission = Boolean(
                        m.raw.reportSubmittedAt
                      );
                      const stats = milestoneTaskStats.get(m.id);
                      const derivedProgress = stats?.percent ?? null;
                      const progressPercent =
                        derivedProgress ?? m.progressPercent ?? 0;

                      const isOverdue = (() => {
                        if (!m.dueDateRaw || hasReportSubmission) return false;

                        const dueDate = new Date(m.dueDateRaw);
                        const today = new Date();
                        dueDate.setHours(23, 59, 59, 999);
                        return dueDate < today;
                      })();

                      return (
                        <div
                          key={m.id}
                          className="flex items-start gap-4 group"
                        >
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

                          <div
                            className={cn(
                              "flex-1 rounded-xl border-2 bg-card p-6 transition-all duration-200",
                              "hover:shadow-lg hover:-translate-y-1",
                              hasReportSubmission
                                ? "border-emerald-300/60 bg-gradient-to-br from-emerald-50/70 via-emerald-50/30 to-background shadow-emerald-100/50 shadow-md"
                                : isFinalMilestone
                                ? "border-orange-300/60 bg-gradient-to-br from-orange-50/50 via-orange-50/20 to-background shadow-orange-100/50 shadow-md"
                                : isOverdue
                                ? "border-red-300/60 bg-gradient-to-br from-red-50/50 via-red-50/20 to-background shadow-red-100/50 shadow-md"
                                : "border-border/60 hover:border-primary/60 hover:shadow-md"
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
                                    <span>
                                      {m.dueDateDisplay || "Chưa có hạn"}
                                    </span>
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
                                <Progress
                                  value={progressPercent}
                                  className="h-2"
                                />
                              </div>
                            )}

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

                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={() => handleOpenMilestone(m)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1 sm:flex-none"
                                onClick={() => {
                                  setSelectedMilestone(m);
                                  setDeleteConfirmOpen(true);
                                }}
                                disabled={
                                  hasReportSubmission ||
                                  deleteMilestoneMutation.isPending
                                }
                                title={
                                  hasReportSubmission
                                    ? "Không thể xóa tiến độ đã nộp báo cáo"
                                    : ""
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
                        disabled={
                          deleteMilestoneMutation.isPending ||
                          checkHasReportSubmission(selectedMilestone)
                        }
                        title={
                          checkHasReportSubmission(selectedMilestone)
                            ? "Không thể xóa tiến độ đã nộp báo cáo"
                            : ""
                        }
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
                {...updateForm.register("description")}
                className={
                  updateForm.formState.errors.description
                    ? "border-destructive"
                    : ""
                }
              />
              {updateForm.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {updateForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-due">Hạn xử lý</Label>
              <Controller
                control={updateForm.control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value || undefined}
                    onChange={(value) => field.onChange(value ?? "")}
                    fromDate={new Date()}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Controller
                control={updateForm.control}
                name="status"
                render={({ field }) => (
                  <select
                    id="edit-status"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    {...field}
                  >
                    <option value="Pending">Đang chờ</option>
                    <option value="InProgress">Đang xử lý</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Delayed">Trễ hạn</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                )}
              />
              {updateForm.formState.errors.status && (
                <p className="text-sm text-destructive">
                  {updateForm.formState.errors.status.message}
                </p>
              )}
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

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              {selectedMilestone &&
              checkHasReportSubmission(selectedMilestone) ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      Không thể xóa tiến độ đã nộp báo cáo. Vui lòng đóng dialog
                      này.
                    </span>
                  </div>
                </div>
              ) : (
                "Hành động này sẽ xóa tiến độ vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?"
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteMilestone}
                disabled={
                  deleteMilestoneMutation.isPending ||
                  Boolean(
                    selectedMilestone &&
                      checkHasReportSubmission(selectedMilestone)
                  )
                }
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
                {...createForm.register("description")}
                className={
                  createForm.formState.errors.description
                    ? "border-destructive"
                    : ""
                }
              />
              {createForm.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-due">Hạn xử lý</Label>
              <Controller
                control={createForm.control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value || undefined}
                    onChange={(value) => field.onChange(value ?? "")}
                    placeholder="Chọn hạn xử lý"
                    fromDate={new Date()}
                    className={cn(
                      createForm.watch("isFinal") &&
                        "border-primary/60 text-primary ring-1 ring-primary/40"
                    )}
                  />
                )}
              />
              {createForm.watch("isFinal") ? (
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
                <Controller
                  control={createForm.control}
                  name="isFinal"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={hasFinalMilestone || isProjectPending}
                    />
                  )}
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
    </MentorLayout>
  );
}
