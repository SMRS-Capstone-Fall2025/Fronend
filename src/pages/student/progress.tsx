import { ProjectSelectCard } from "@/components/projects/project-select-card";
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
import { Card, CardContent } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDateDisplay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  useProjectMilestonesQuery,
  useSubmitMilestoneReportMutation,
} from "@/services/milestone";
import { useTasksListQuery } from "@/services/task/hooks";
import type { MilestoneDto, UploadResponse } from "@/services/types";
import { useUploadFileMutation } from "@/services/upload";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock4,
  ExternalLink,
  FileText,
  Milestone,
  TrendingUp,
  Upload,
  UploadIcon,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import StudentLayout from "./layout";

const milestoneStatusMap: Record<
  string,
  { readonly label: string; readonly badge: string }
> = {
  Pending: {
    label: "Đang chờ",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  InProgress: {
    label: "Đang xử lý",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
  },
  Completed: {
    label: "Hoàn thành",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  Delayed: { label: "Trễ hạn", badge: "border-red-200 bg-red-50 text-red-700" },
  Cancelled: {
    label: "Đã hủy",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
  },
  Submitted: {
    label: "Đã nộp",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  unknown: {
    label: "Không rõ",
    badge: "border-muted bg-muted/40 text-muted-foreground",
  },
};

const extractUploadUrl = (response?: UploadResponse | null): string | null => {
  if (!response?.data) return null;
  if (typeof response.data === "string") {
    return response.data;
  }
  return response.data.url ?? response.data.path ?? null;
};

export default function StudentProgressPage() {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] =
    useState<MilestoneDto | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const { toast } = useToast();

  const projectId = useMemo(() => {
    const parsed = Number(selectedProjectId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [selectedProjectId]);

  const {
    data: milestoneData,
    isLoading,
    isError,
  } = useProjectMilestonesQuery(projectId);

  const { data: taskListResponse } = useTasksListQuery({
    projectId: projectId ?? undefined,
    page: 1,
    size: 1000,
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
      if (typeof task.milestoneId !== "number") continue;

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

  const milestones = useMemo(
    () =>
      (milestoneData ?? []).map((m) => ({
        ...m,
        dueDateDisplay: formatDateDisplay(m.dueDate) ?? null,
      })),
    [milestoneData]
  );

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const formatDateTimeValue = useCallback(
    (value?: string | null) => {
      if (!value) return null;
      try {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
          return value;
        }
        return dateTimeFormatter.format(parsed);
      } catch {
        return value;
      }
    },
    [dateTimeFormatter]
  );

  const uploadFileMutation = useUploadFileMutation({
    onSuccess: () => {
      toast({ title: "Tệp đã được tải lên" });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Không thể tải tệp",
        description: err.message,
      });
    },
  });

  const submitReportMutation = useSubmitMilestoneReportMutation();
  const isReportActionPending =
    uploadFileMutation.isPending || submitReportMutation.isPending;

  const submitReport = async () => {
    if (!selectedMilestone) return;

    if (selectedMilestone.reportSubmittedAt) {
      toast({
        variant: "destructive",
        title: "Báo cáo đã được nộp",
        description:
          "Tiến độ này đã có báo cáo trước đó. Vui lòng chọn tiến độ khác.",
      });
      return;
    }

    const trimmedComment = reportText.trim();

    // Bắt buộc phải có cả file report và comment
    if (!reportFile) {
      toast({
        variant: "destructive",
        title: "Thiếu file báo cáo",
        description: "Vui lòng đính kèm file báo cáo trước khi nộp.",
      });
      return;
    }

    if (!trimmedComment) {
      toast({
        variant: "destructive",
        title: "Thiếu mô tả báo cáo",
        description: "Vui lòng nhập mô tả báo cáo trước khi nộp.",
      });
      return;
    }

    const due = selectedMilestone.dueDate;
    if (due) {
      const deadline = new Date(due);
      deadline.setHours(23, 59, 59, 999);
      const now = new Date();
      if (now > deadline) {
        toast({
          variant: "destructive",
          title: "Đã quá hạn",
          description: "Không thể nộp báo cáo sau hạn chót.",
        });
        return;
      }
    }

    try {
      let uploadedUrl: string | null = null;

      if (reportFile) {
        const uploadResponse = await uploadFileMutation.mutateAsync({
          file: reportFile,
        });
        uploadedUrl = extractUploadUrl(uploadResponse);
        if (!uploadedUrl) {
          throw new Error(
            "Máy chủ không trả về đường dẫn tệp sau khi tải lên."
          );
        }
      }

      await submitReportMutation.mutateAsync({
        id: selectedMilestone.id,
        projectId: selectedMilestone.projectId ?? projectId ?? undefined,
        payload: {
          ...(uploadedUrl ? { reportUrl: uploadedUrl } : {}),
          ...(trimmedComment ? { reportComment: trimmedComment } : {}),
        },
      });

      toast({
        title: "Nộp báo cáo thành công",
        description: "Báo cáo tiến độ đã được gửi đến mentor.",
      });
      setReportOpen(false);
      setReportText("");
      setReportFile(null);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Không thể nộp báo cáo. Vui lòng thử lại sau.";
      toast({
        variant: "destructive",
        title: "Lỗi khi nộp báo cáo",
        description: errorMessage,
      });
    }
  };

  const handleConfirmSubmit = async () => {
    setConfirmSubmitOpen(false);
    await submitReport();
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Quản lý tiến độ
              </h1>
              <p className="text-sm text-muted-foreground">
                Xem tiến độ của dự án và nộp báo cáo tiến độ trước hạn.
              </p>
            </div>
          </div>
        </div>
        <ProjectSelectCard
          selectedProjectId={selectedProjectId}
          onValueChange={setSelectedProjectId}
          title="Chọn dự án"
          description="Chọn dự án để xem và quản lý tiến độ"
          placeholder="Chọn dự án"
          icon={Milestone}
        />

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
            {isError && (
              <div className="text-sm text-destructive">
                Không thể tải tiến độ.
              </div>
            )}
            {!isError && isLoading && (
              <div className="space-y-2">
                <div className="h-20 animate-pulse rounded-lg border border-border/60 bg-muted/30" />
              </div>
            )}
            {!isError && !isLoading && (
              <div className="space-y-3">
                {milestones.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border/60 bg-gradient-to-br from-slate-50/50 to-muted/20 dark:from-slate-900/30 dark:to-slate-800/20 p-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      Chưa có tiến độ cho dự án này
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Mentor sẽ tạo các milestone cho dự án của bạn
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((m, idx) => {
                      const hasReportSubmission = Boolean(m.reportSubmittedAt);
                      const stats = milestoneTaskStats.get(m.id);
                      const progressPercent = stats?.percent ?? 0;
                      const isOverdue = (() => {
                        if (!m.dueDate || hasReportSubmission) return false;
                        const dueDate = new Date(m.dueDate);
                        const today = new Date();
                        dueDate.setHours(23, 59, 59, 999);
                        return dueDate < today;
                      })();

                      return (
                        <div
                          key={m.id}
                          className="flex items-start gap-4 group"
                        >
                          {/* Timeline marker */}
                          <div className="flex w-12 flex-col items-center pt-1">
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border-2 transition-all duration-200",
                                hasReportSubmission
                                  ? "border-emerald-500 bg-emerald-500 shadow-emerald-200 shadow-md"
                                  : "border-primary bg-background group-hover:scale-125 group-hover:border-primary group-hover:bg-primary"
                              )}
                            >
                              {hasReportSubmission && (
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              )}
                            </div>
                            {idx < milestones.length - 1 && (
                              <div className="flex-1 w-0.5 bg-border/60 mt-2 min-h-[60px] transition-colors duration-200 group-hover:bg-primary/40" />
                            )}
                          </div>

                          {/* Milestone card */}
                          <div
                            className={cn(
                              "flex-1 rounded-xl border-2 bg-card p-6 transition-all duration-200 cursor-pointer",
                              "hover:shadow-lg hover:-translate-y-1",
                              hasReportSubmission
                                ? "border-emerald-300/60 bg-gradient-to-br from-emerald-50/70 via-emerald-50/30 to-background shadow-emerald-100/50 shadow-md"
                                : isOverdue
                                ? "border-red-300/60 bg-gradient-to-br from-red-50/50 via-red-50/20 to-background shadow-red-100/50 shadow-md"
                                : "border-border/60 hover:border-primary/60 hover:shadow-md"
                            )}
                            onClick={() => {
                              setSelectedMilestone(m);
                              setDetailOpen(true);
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-foreground text-base">
                                    {m.description}
                                  </h3>
                                  {m.isFinal && (
                                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-0 text-[10px] font-bold uppercase tracking-wider">
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
                                    milestoneStatusMap[m.status ?? "unknown"]
                                      ?.badge
                                  )}
                                >
                                  {
                                    milestoneStatusMap[m.status ?? "unknown"]
                                      ?.label
                                  }
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
                                <Progress
                                  value={progressPercent}
                                  className="h-2"
                                />
                              </div>
                            )}

                            {/* Report status */}
                            {hasReportSubmission && (
                              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="font-medium">
                                  Đã nộp báo cáo
                                  {formatDateTimeValue(m.reportSubmittedAt)
                                    ? ` • ${formatDateTimeValue(
                                        m.reportSubmittedAt
                                      )}`
                                    : ""}
                                </span>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="mt-4 flex gap-2">
                              {!hasReportSubmission &&
                                stats &&
                                stats.total > 0 &&
                                stats.percent === 100 && (
                                  <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => {
                                      setSelectedMilestone(m);
                                      setReportOpen(true);
                                    }}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Nộp báo cáo
                                  </Button>
                                )}
                              {!hasReportSubmission &&
                                (!stats ||
                                  stats.total === 0 ||
                                  stats.percent !== 100) && (
                                  <div className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 text-xs text-muted-foreground bg-muted/50 rounded-md border border-border/60">
                                    {!stats || stats.total === 0
                                      ? "Chưa có task"
                                      : `Hoàn thành ${stats.percent}% task`}
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
            )}
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            {selectedMilestone ? (
              <>
                {/* Sticky Header with Gradient */}
                <div className="sticky top-0 z-10 border-b border-blue-600/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-6 py-5 shadow-lg">
                  <DialogHeader className="text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        <Milestone className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <DialogTitle className="text-lg font-semibold text-white">
                            {selectedMilestone.description}
                          </DialogTitle>
                          {selectedMilestone.isFinal ? (
                            <Badge className="bg-white/20 text-white border-white/30 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                              Final report
                            </Badge>
                          ) : null}
                        </div>
                        <DialogDescription className="text-blue-100">
                          {selectedMilestone.dueDate
                            ? `Hạn xử lý: ${
                                formatDateDisplay(selectedMilestone.dueDate) ??
                                selectedMilestone.dueDate
                              }`
                            : "Chưa có hạn xử lý"}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-5 text-sm">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            milestoneStatusMap[
                              selectedMilestone.status ?? "unknown"
                            ]?.badge
                          }`}
                        >
                          {
                            milestoneStatusMap[
                              selectedMilestone.status ?? "unknown"
                            ]?.label
                          }
                        </Badge>
                        {(() => {
                          const stats = milestoneTaskStats.get(
                            selectedMilestone.id
                          );
                          const progressPercent = stats?.percent ?? 0;
                          return (
                            <span className="text-xs font-medium text-muted-foreground">
                              {progressPercent}%
                              {stats && ` (${stats.done}/${stats.total} tasks)`}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="mt-4 grid gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Ngày tạo</span>
                          <span className="text-foreground font-medium">
                            {formatDateTimeValue(selectedMilestone.createdAt) ??
                              "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Hạn xử lý</span>
                          <span className="text-foreground font-medium">
                            {formatDateDisplay(selectedMilestone.dueDate) ??
                              "Chưa có"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Mã dự án</span>
                          <span className="text-foreground font-medium">
                            {selectedMilestone.projectId ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Mã milestone</span>
                          <span className="text-foreground font-medium">
                            #{selectedMilestone.id}
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const stats = milestoneTaskStats.get(
                          selectedMilestone.id
                        );
                        const progressPercent = stats?.percent ?? 0;
                        return (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                Tiến độ
                                {stats &&
                                  ` (${stats.done}/${stats.total} tasks)`}
                              </span>
                              <span className="font-semibold text-foreground">
                                {progressPercent}%
                              </span>
                            </div>
                            <Progress value={progressPercent} />
                          </div>
                        );
                      })()}
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-background/60 p-5">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Nội dung milestone
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {selectedMilestone.description ??
                          "Không có mô tả chi tiết."}
                      </p>
                    </div>

                    {(() => {
                      const hasReportDetails = Boolean(
                        selectedMilestone.reportUrl ||
                          selectedMilestone.reportSubmittedAt ||
                          selectedMilestone.reportSubmittedByName ||
                          selectedMilestone.reportComment
                      );
                      const submittedAtDisplay = formatDateTimeValue(
                        selectedMilestone.reportSubmittedAt
                      );

                      if (hasReportDetails) {
                        return (
                          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-5 shadow-inner">
                            <div className="flex items-center gap-2 text-emerald-900">
                              <FileText className="h-5 w-5" />
                              <p className="text-sm font-semibold uppercase tracking-wide">
                                Chi tiết báo cáo
                              </p>
                            </div>

                            <div className="mt-4 space-y-3 text-sm text-emerald-900">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <UserRound className="h-3.5 w-3.5 text-emerald-700" />
                                <span className="uppercase tracking-wide text-emerald-700/80">
                                  Người nộp
                                </span>
                                <span className="font-semibold text-emerald-900">
                                  {selectedMilestone.reportSubmittedByName ??
                                    "Không rõ"}
                                </span>
                              </div>
                              {submittedAtDisplay ? (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <Clock4 className="h-3.5 w-3.5 text-emerald-700" />
                                  <span className="uppercase tracking-wide text-emerald-700/80">
                                    Thời gian nộp
                                  </span>
                                  <span className="font-semibold text-emerald-900">
                                    {submittedAtDisplay}
                                  </span>
                                </div>
                              ) : null}

                              {selectedMilestone.reportComment ? (
                                <div className="rounded-lg border border-emerald-100 bg-white/80 p-3 text-sm text-emerald-900">
                                  “{selectedMilestone.reportComment}”
                                </div>
                              ) : null}
                            </div>

                            {selectedMilestone.reportUrl ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 border-emerald-300 text-emerald-900"
                                asChild
                              >
                                <a
                                  href={selectedMilestone.reportUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Mở tệp báo cáo
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        );
                      }

                      return (
                        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-5 text-sm text-muted-foreground">
                          Chưa có báo cáo nào được nộp cho tiến độ này.
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
        <Dialog
          open={reportOpen}
          onOpenChange={(open) => {
            if (!open) {
              setReportText("");
              setReportFile(null);
              setConfirmSubmitOpen(false);
            }
            setReportOpen(open);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
            {/* Sticky Header with Gradient */}
            <div className="sticky top-0 z-10 border-b border-blue-600/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-6 py-5 shadow-lg">
              <DialogHeader className="text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-semibold text-white">
                      Nộp báo cáo tiến độ
                    </DialogTitle>
                    <DialogDescription className="text-blue-100 mt-1">
                      {selectedMilestone?.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1 min-h-0 max-h-[calc(90vh-180px)] px-6">
              <div className="space-y-5 py-6">
                {/* Milestone info */}
                {selectedMilestone && (
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Hạn nộp
                        </p>
                        <p className="font-medium flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {formatDateDisplay(selectedMilestone.dueDate) ||
                            "Chưa có hạn"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Trạng thái
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            milestoneStatusMap[
                              selectedMilestone.status ?? "unknown"
                            ]?.badge
                          )}
                        >
                          {
                            milestoneStatusMap[
                              selectedMilestone.status ?? "unknown"
                            ]?.label
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report text */}
                <div className="space-y-2">
                  <Label
                    htmlFor="report-text"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    Nội dung báo cáo
                  </Label>
                  <Textarea
                    id="report-text"
                    placeholder="Mô tả chi tiết về tiến độ công việc, kết quả đạt được, khó khăn gặp phải..."
                    className="min-h-[120px] resize-none"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nhập mô tả chi tiết về công việc đã hoàn thành
                  </p>
                </div>

                {/* File upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <UploadIcon className="h-4 w-4 text-primary" />
                    Đính kèm tài liệu
                  </Label>

                  {!reportFile ? (
                    <div
                      className="rounded-lg border-2 border-dashed border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const files = Array.from(
                          event.dataTransfer.files || []
                        );
                        setReportFile(files[0] ?? null);
                      }}
                    >
                      <label
                        htmlFor="report-file"
                        className="flex flex-col items-center gap-3 px-6 py-8 cursor-pointer"
                      >
                        <div className="rounded-full bg-primary/10 p-4">
                          <UploadIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">
                            Kéo thả tệp vào đây
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            hoặc nhấp để chọn từ máy tính
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Hỗ trợ: PDF, DOC, DOCX, PPT, PPTX (tối đa 10MB)
                          </p>
                        </div>
                        <input
                          id="report-file"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={(event) => {
                            setReportFile(event.target.files?.[0] ?? null);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-100 p-3">
                          <FileText className="h-6 w-6 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {reportFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(reportFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setReportFile(null)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Warning */}
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-medium">Lưu ý quan trọng</p>
                      <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                        <li>Báo cáo không thể chỉnh sửa sau khi nộp</li>
                        <li>Vui lòng kiểm tra kỹ nội dung trước khi gửi</li>
                        <li>
                          Mentor sẽ nhận được thông báo ngay sau khi bạn nộp
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2 sm:gap-2 border-t px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setReportOpen(false)}
                disabled={isReportActionPending}
              >
                Hủy
              </Button>
              <Button
                onClick={() => setConfirmSubmitOpen(true)}
                disabled={
                  isReportActionPending || !reportFile || !reportText.trim()
                }
                className="gap-2"
              >
                {isReportActionPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Gửi báo cáo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={confirmSubmitOpen}
          onOpenChange={setConfirmSubmitOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận nộp báo cáo?</AlertDialogTitle>
              <AlertDialogDescription>
                Báo cáo sẽ được gửi tới mentor phụ trách và không thể chỉnh sửa
                sau khi nộp. Hãy chắc chắn nội dung chính xác trước khi tiếp
                tục.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-sm text-muted-foreground">
              {selectedMilestone?.description ?? "Chưa chọn tiến độ."}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isReportActionPending}>
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmSubmit}
                disabled={isReportActionPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isReportActionPending ? "Đang gửi..." : "Xác nhận nộp"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StudentLayout>
  );
}
