import MentorLayout from "./layout";
import { TasksPageContent } from "../student/tasks";

export default function MentorTasks() {
  return <TasksPageContent layout={MentorLayout} />;
}
/* Legacy mentor milestone management view (kept temporarily for reference)
import { useEffect, useMemo, useRef, useState } from "react";
import MentorLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertCircle, PlusCircle, ShieldAlertIcon } from "lucide-react";
import {
  ProjectSelect,
  type ProjectSelectOption,
} from "@/components/project-select";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useCreateMilestoneMutation,
  useProjectMilestonesQuery,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
} from "@/services/milestone";
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
  };
};

const normalizeDueDateForPayload = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("T")) return trimmed;
  return `${trimmed}T00:00:00`;
};

export default function MentorTasksLegacy() {
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
  });

  const selectTriggerRef = useRef<HTMLButtonElement | null>(null);
  const accountId = useAuthAccountStore((state) => state.account?.id ?? null);
  const accountRoleRaw = useAuthAccountStore(
    (state) => state.account?.role?.roleName ?? state.account?.roleName ?? ""
  );
  const { toast } = useToast();

  const normalizedRole = String(accountRoleRaw ?? "")
    .trim()
    .toLowerCase();
  const teacherRoles = ["lecturer", "mentor", "instructor", "teacher"];
  const isTeacher = teacherRoles.includes(normalizedRole);

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
      setDraftMilestone({ description: "", dueDate: "" });
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

  const projectDescription = selectedProjectMeta?.description ?? null;
  const isProjectPending = selectedProjectMeta?.status === "Pending";
  const canLoadMilestones = projectId != null;

  const handleOpenMilestone = (milestone: MilestoneItem) => {
    setSelectedMilestone(milestone);
    setDetailOpen(true);
  };

  const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards");

  const sortedMilestones = useMemo(() => {
    return [...projectMilestones].sort((a, b) => {
      const da = a.dueDateRaw ? new Date(a.dueDateRaw).getTime() : Infinity;
      const db = b.dueDateRaw ? new Date(b.dueDateRaw).getTime() : Infinity;
      return da - db;
    });
  }, [projectMilestones]);

  const resetDraft = () =>
    setDraftMilestone({
      description: "",
      dueDate: "",
    });

  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({
    description: "",
    dueDate: "",
    status: "Pending",
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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

    const payload: MilestoneCreateRequest = {
      projectId,
      description,
      ...(dueDatePayload ? { dueDate: dueDatePayload } : {}),
      ...(accountId != null ? { createById: accountId } : {}),
    };

    createMilestoneMutation.mutate(payload);
  };

  return (
    <MentorLayout>
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

        <Card>
          <CardHeader className="space-y-3">
            <div className="space-y-1">
              <CardTitle className="text-base">Chọn dự án mentoring</CardTitle>
              <p className="text-xs text-muted-foreground">
                Xem milestone và báo cáo tương ứng của từng dự án.
              </p>
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
                        Dự án đang chờ hội đồng duyệt. Vui lòng đợi phê duyệt
                        trước khi tiếp tục thao tác với milestone.
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 mr-2">
                  <Button
                    size="sm"
                    variant={viewMode === "cards" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("cards")}
                  >
                    Danh sách
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "timeline" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("timeline")}
                  >
                    Timeline
                  </Button>
                </div>
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
                    !canLoadMilestones ||
                    isProjectPending ||
                    createMilestoneMutation.isPending
                  }
                >
                  <PlusCircle className="h-4 w-4" />
                  Tạo tiến độ
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-4">
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
                <>
                  {viewMode === "cards" ? (
                    projectMilestones.map((milestone) => {
                      const styles = statusMeta[milestone.status];

                      return (
                        <div
                          key={milestone.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenMilestone(milestone)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleOpenMilestone(milestone);
                            }
                          }}
                          className={cn(
                            "rounded-lg border border-border/60 bg-background/60 p-4 text-left transition hover:border-primary/50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            detailOpen && selectedMilestone?.id === milestone.id
                              ? "border-primary"
                              : undefined
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">
                                {milestone.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {milestone.dueDateDisplay
                                  ? `Hạn xử lý: ${milestone.dueDateDisplay}`
                                  : "Chưa có hạn xử lý"}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", styles.badge)}
                            >
                              {styles.label}
                            </Badge>
                          </div>
                          <div className="mt-3 text-xs text-muted-foreground">
                            {milestone.progressPercent != null
                              ? `Tiến độ hiện tại: ${milestone.progressPercent}%`
                              : "Chưa cập nhật tiến độ"}
                            {milestone.createdAtDisplay
                              ? ` • Tạo lúc ${milestone.createdAtDisplay}`
                              : null}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-4">
                      {sortedMilestones.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                          Chưa có tiến độ nào cho dự án này.
                        </div>
                      ) : (
                        sortedMilestones.map((m, idx) => (
                          <div key={m.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <span className="h-3 w-3 rounded-full bg-primary" />
                              {idx < sortedMilestones.length - 1 ? (
                                <div className="h-full w-[2px] bg-border/60 mt-1" />
                              ) : null}
                            </div>
                            <div className="flex-1 rounded-lg border border-border/60 bg-background/60 p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-foreground">
                                    {m.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {m.dueDateDisplay
                                      ? `Hạn xử lý: ${m.dueDateDisplay}`
                                      : "Chưa có hạn xử lý"}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    statusMeta[m.status].badge
                                  )}
                                >
                                  {statusMeta[m.status].label}
                                </Badge>
                              </div>
                              <div className="mt-2 text-sm text-muted-foreground">
                                {m.progressPercent != null
                                  ? `Tiến độ: ${m.progressPercent}%`
                                  : "Chưa cập nhật tiến độ"}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )
            ) : selectedProjectId ? (
              <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                Dự án này chưa có mã hợp lệ để đồng bộ milestone.
              </div>
            ) : null}

            <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
              Tính năng bảng Kanban cho mentor sẽ sớm được bổ sung.
            </div>
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
                <DialogDescription>
                  {selectedMilestone.dueDateDisplay
                    ? `Hạn xử lý: ${selectedMilestone.dueDateDisplay}`
                    : "Chưa có hạn xử lý"}
                </DialogDescription>
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

                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Mô tả</h3>
                  <p className="text-muted-foreground">
                    {selectedMilestone.description}
                  </p>
                </div>

                {selectedMilestone.progressPercent != null ? (
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">
                      Tiến độ tổng quan
                    </h3>
                    <Progress value={selectedMilestone.progressPercent} />
                  </div>
                ) : null}

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

  {/* Edit milestone dialog * /}
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

  {/* Delete confirm dialog * /}
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
              />
              <p className="text-[11px] text-muted-foreground">
                Bỏ trống nếu milestone không có hạn cụ thể.
              </p>
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
*/
