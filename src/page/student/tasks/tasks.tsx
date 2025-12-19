import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  Loader2,
  Milestone,
  RefreshCw,
  Save,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Controller, useForm } from "react-hook-form";
import StudentLayout from "./layout";

import { ProjectSelectOption } from "@/components/project-select";
import { ProjectSelectCard } from "@/components/projects/project-select-card";
import { DeleteConfirmDialog } from "@/components/tasks/delete-confirm-dialog";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { TaskFilters } from "@/components/tasks/task-filters";
import type {
  MilestoneFilterOption,
  ProjectMemberOption,
} from "@/components/tasks/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDateDisplay } from "@/lib/date-utils";
import {
  TASK_COLUMN_META,
  TASK_STATUS_ORDER,
  createEmptyTaskBoard,
  groupTasksByStatus,
} from "@/lib/task-board";
import { cn, getErrorMessage } from "@/lib/utils";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task";
import { useProjectMilestonesQuery } from "@/services/milestone";
import { useProjectDetailQuery } from "@/services/project";
import {
  taskQueryKeys,
  useAssignTaskMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useTaskQuery,
  useTasksListQuery,
  useUpdateTaskMutation,
} from "@/services/task/hooks";
import type { ProjectMemberDetailDto } from "@/services/types/project";
import type {
  CreateTaskRequest,
  TaskDto,
  TaskStatus,
} from "@/services/types/task";

const STATUS_ORDER = TASK_STATUS_ORDER;

type LayoutComponentType = ComponentType<{ readonly children: ReactNode }>;

type TasksPageContentProps = {
  readonly layout?: LayoutComponentType | null;
};

export function TasksPageContent({
  layout: LayoutComponent = StudentLayout,
}: TasksPageContentProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [board, setBoard] = useState<Record<TaskStatus, TaskDto[]>>(() =>
    createEmptyTaskBoard()
  );
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProject, setSelectedProject] =
    useState<ProjectSelectOption | null>(null);
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [milestoneFilter, setMilestoneFilter] = useState<string>("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [assignSelection, setAssignSelection] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const selectTriggerRef = useRef<HTMLButtonElement | null>(null);

  const projectDetailId = useMemo(() => {
    if (!selectedProjectId) return null;
    const numericId = Number(selectedProjectId);
    if (Number.isFinite(numericId) && numericId > 0) {
      return numericId;
    }
    return selectedProjectId;
  }, [selectedProjectId]);

  const { data, isLoading, isFetching, refetch } = useTasksListQuery(
    {
      page: 1,
      size: 1000,
      projectId: projectDetailId ?? null,
    },
    {
      enabled: !!projectDetailId,
    }
  );

  const {
    data: projectDetail,
    isLoading: isProjectDetailLoading,
    isFetching: isProjectDetailFetching,
    isError: isProjectDetailError,
    error: projectDetailError,
  } = useProjectDetailQuery(projectDetailId);

  const isProjectMembersLoading =
    (isProjectDetailLoading || isProjectDetailFetching) &&
    !projectDetail?.members?.length;

  const projectMembersErrorMessage =
    projectDetailError?.message ?? "Không thể tải danh sách thành viên";

  const milestoneProjectId = useMemo(() => {
    if (typeof projectDetailId === "number") return projectDetailId;
    const numeric = Number(selectedProjectId);
    return Number.isFinite(numeric) ? numeric : null;
  }, [projectDetailId, selectedProjectId]);

  const {
    data: projectMilestonesData,
    isLoading: isProjectMilestonesLoading,
    isFetching: isProjectMilestonesFetching,
    isError: isProjectMilestonesError,
    error: projectMilestonesError,
  } = useProjectMilestonesQuery(milestoneProjectId);

  const projectMilestones = useMemo(
    () => projectMilestonesData ?? [],
    [projectMilestonesData]
  );
  const projectMilestonesErrorMessage =
    projectMilestonesError?.message ?? "Không thể tải danh sách tiến độ";

  const {
    data: activeTask,
    isLoading: isTaskDetailLoading,
    isFetching: isTaskDetailFetching,
    isError: isTaskDetailError,
    error: taskDetailError,
    refetch: refetchTaskDetail,
  } = useTaskQuery(activeTaskId, {
    enabled: detailOpen && activeTaskId != null,
    queryKey: ["task", activeTaskId],
    refetchOnMount: "always",
    staleTime: 0,
  });

  const { data: editTask } = useTaskQuery(editTaskId, {
    enabled: editTaskId != null,
    queryKey: ["task", editTaskId],
  });

  const isTaskDetailPending = isTaskDetailLoading || isTaskDetailFetching;
  const taskDetailErrorMessage =
    taskDetailError?.message ?? "Không thể tải chi tiết công việc";
  const activeTaskAssigneeId =
    activeTask?.assignedTo?.id != null ? activeTask.assignedTo.id : null;

  const memberOptions = useMemo<ProjectMemberOption[]>(() => {
    const seen = new Set<string>();
    const normalized: ProjectMemberOption[] = [];

    if (projectDetail?.owner) {
      const owner = projectDetail.owner;
      const ownerId = owner.id;
      if (ownerId != null && Number.isFinite(ownerId)) {
        const value = String(ownerId);
        if (!seen.has(value)) {
          seen.add(value);
          normalized.push({
            value,
            label: owner.name?.trim() || "Chủ dự án",
            description: owner.email ?? undefined,
            role: "Owner",
            status: null,
          });
        }
      }
    }

    if (projectDetail?.lecturer) {
      const lecturer = projectDetail.lecturer;
      const lecturerId = lecturer.accountId ?? lecturer.id;
      if (lecturerId != null && Number.isFinite(lecturerId)) {
        const value = String(lecturerId);
        if (!seen.has(value)) {
          seen.add(value);
          normalized.push({
            value,
            label: lecturer.name?.trim() || "Giảng viên",
            description: lecturer.email ?? undefined,
            role: "Lecturer",
            status: lecturer.status ?? null,
          });
        }
      }
    }

    const members = projectDetail?.members;
    if (members && members.length > 0) {
      members.forEach((member: ProjectMemberDetailDto, index) => {
        const memberStatus = member.status?.trim()?.toLowerCase();
        if (!memberStatus || memberStatus !== "approved") {
          return;
        }

        const accountIdCandidate = Number(member.accountId ?? member.id);
        if (!Number.isFinite(accountIdCandidate)) return;

        const value = String(accountIdCandidate);
        if (seen.has(value)) return;
        seen.add(value);

        const label = member.name?.trim() || `Thành viên ${index + 1}`;

        normalized.push({
          value,
          label,
          description: member.email || "",
          role: "Member",
          status: member.status ?? null,
        });
      });
    }

    return normalized.sort((a, b) =>
      a.label.localeCompare(b.label, "vi", { sensitivity: "base" })
    );
  }, [projectDetail]);

  const milestoneOptions = useMemo<MilestoneFilterOption[]>(() => {
    if (!Array.isArray(projectMilestones) || projectMilestones.length === 0) {
      return [];
    }

    return projectMilestones
      .map((milestone) => {
        const id = Number(milestone?.id);
        if (!Number.isFinite(id) || id <= 0) return null;

        const label = milestone.description?.trim()
          ? milestone.description.trim()
          : `Tiến độ ${id}`;

        const progressValue =
          typeof milestone.progressPercent === "number" &&
          Number.isFinite(milestone.progressPercent)
            ? Math.round(Math.min(100, Math.max(0, milestone.progressPercent)))
            : null;

        return {
          value: String(id),
          label,
          progressPercent: progressValue,
          status: milestone.status ?? null,
          dueDateDisplay: formatDateDisplay(milestone.dueDate) ?? null,
        } as MilestoneFilterOption;
      })
      .filter((option): option is MilestoneFilterOption => option != null);
  }, [projectMilestones]);

  const isMilestoneSelectLoading =
    (isProjectMilestonesLoading || isProjectMilestonesFetching) &&
    projectDetailId != null;

  const isFilterDisabled = projectDetailId == null;

  const visibleBoard = useMemo(() => {
    const shouldFilterByMember = memberFilter !== "all";
    const shouldFilterByMilestone = milestoneFilter !== "all";

    if (!shouldFilterByMember && !shouldFilterByMilestone) {
      return board;
    }

    const filtered = createEmptyTaskBoard();
    const filterMemberUnassigned = memberFilter === "__unassigned";
    const filterMilestoneUnassigned = milestoneFilter === "__noMilestone";

    for (const status of STATUS_ORDER) {
      const tasks = board[status] ?? [];
      filtered[status] = tasks.filter((task) => {
        if (shouldFilterByMember) {
          if (filterMemberUnassigned) {
            if (task.assignedTo?.id) return false;
          } else {
            const assignedId = task.assignedTo?.id;
            if (assignedId == null || String(assignedId) !== memberFilter) {
              return false;
            }
          }
        }

        if (shouldFilterByMilestone) {
          const taskMilestoneId = task.milestoneId;
          if (filterMilestoneUnassigned) {
            if (taskMilestoneId != null) return false;
          } else if (
            taskMilestoneId == null ||
            String(taskMilestoneId) !== milestoneFilter
          ) {
            return false;
          }
        }

        return true;
      });
    }

    return filtered;
  }, [board, memberFilter, milestoneFilter]);

  const handleTaskSelect = (task: TaskDto) => {
    if (!task?.id) return;
    setActiveTaskId(task.id);
    setDetailOpen(true);

    queryClient.invalidateQueries({
      queryKey: taskQueryKeys.item(task.id),
    });
  };

  const handleTaskDetailClose = (nextOpen: boolean) => {
    if (nextOpen) return;
    setDetailOpen(false);
    setActiveTaskId(null);
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      assignedToId: undefined,
      milestoneId: undefined,
      deadline: "",
    },
  });

  useEffect(() => {
    setMemberFilter("all");
    setMilestoneFilter("all");
    form.setValue("assignedToId", undefined, { shouldDirty: false });
  }, [selectedProjectId, form]);

  useEffect(() => {
    setBoard(createEmptyTaskBoard());
  }, [projectDetailId]);

  useEffect(() => {
    if (
      memberFilter !== "all" &&
      memberFilter !== "__unassigned" &&
      !memberOptions.some((option) => option.value === memberFilter)
    ) {
      setMemberFilter("all");
    }
  }, [memberOptions, memberFilter]);

  useEffect(() => {
    if (
      milestoneFilter !== "all" &&
      milestoneFilter !== "__noMilestone" &&
      !milestoneOptions.some((option) => option.value === milestoneFilter)
    ) {
      setMilestoneFilter("all");
    }
  }, [milestoneOptions, milestoneFilter]);

  useEffect(() => {
    const currentAssignee = form.getValues("assignedToId");
    if (currentAssignee == null) return;

    const hasAssigneeInOptions = memberOptions.some((option) => {
      const numericValue = Number(option.value);
      return Number.isFinite(numericValue) && numericValue === currentAssignee;
    });

    if (!hasAssigneeInOptions) {
      form.setValue("assignedToId", undefined, { shouldDirty: false });
    }
  }, [memberOptions, form]);

  useEffect(() => {
    if (!detailOpen) {
      setAssignSelection("");
      return;
    }

    if (activeTaskAssigneeId != null) {
      setAssignSelection(String(activeTaskAssigneeId));
    } else {
      setAssignSelection("");
    }
  }, [detailOpen, activeTaskAssigneeId]);

  useEffect(() => {
    if (detailOpen && activeTaskId != null) {
      refetchTaskDetail();
    }
  }, [detailOpen, activeTaskId, refetchTaskDetail]);

  useEffect(() => {
    if (open && editTaskId && editTask) {
      const deadlineDate = editTask.deadline
        ? editTask.deadline.split("T")[0]
        : "";
      form.reset({
        name: editTask.name ?? "",
        description: editTask.description ?? "",
        assignedToId: editTask.assignedTo?.id ?? undefined,
        milestoneId: editTask.milestoneId ?? undefined,
        deadline: deadlineDate,
      });
    } else if (open && !editTaskId) {
      form.reset({
        name: "",
        description: "",
        assignedToId: undefined,
        milestoneId: undefined,
        deadline: "",
      });
    }
  }, [open, editTaskId, editTask, form]);

  const updateMutation = useUpdateTaskMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
      toast({
        title: "Đã cập nhật công việc",
        description: "Công việc đã được cập nhật thành công.",
      });
      setOpen(false);
      setEditTaskId(null);
      form.reset();
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Không thể cập nhật",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditTask = (task: TaskDto) => {
    if (!task?.id) return;
    setEditTaskId(task.id);
    setOpen(true);
  };

  const deleteTaskMutation = useDeleteTaskMutation({
    onSuccess: () => {
      toast({
        title: "Xóa công việc",
        description: "Công việc đã được xóa thành công.",
      });
      setDeleteConfirmOpen(false);
      setDetailOpen(false);
      setActiveTaskId(null);

      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Không thể xóa công việc",
        description: error.message || "Vui lòng thử lại sau.",
      });
    },
  });

  const createMutation = useCreateTaskMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Đã tạo công việc",
        description: "Công việc mới đã được thêm vào bảng.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Không thể tạo công việc",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignTaskMutation = useAssignTaskMutation();

  useEffect(() => {
    setBoard(groupTasksByStatus(data?.data?.items));
  }, [data]);

  const onDragStart = (event: React.DragEvent, taskId: number | undefined) => {
    if (!selectedProjectId) {
      event.preventDefault();
      return;
    }
    if (!taskId) return;
    event.dataTransfer.setData("text/plain", String(taskId));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (event: React.DragEvent) => {
    if (!selectedProjectId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (event: React.DragEvent, targetStatus: TaskStatus) => {
    if (!selectedProjectId) return;
    event.preventDefault();
    const id = Number(event.dataTransfer.getData("text/plain"));
    if (!id) return;

    const fromStatus = STATUS_ORDER.find((status) =>
      board[status].some((task) => task.id === id)
    );
    if (!fromStatus || fromStatus === targetStatus) return;

    const task = board[fromStatus].find((item) => item.id === id);
    if (!task) return;

    setBoard((previous) => {
      const next = createEmptyTaskBoard();
      for (const status of STATUS_ORDER) {
        next[status] = [...(previous[status] ?? [])];
      }
      next[fromStatus] = next[fromStatus].filter((item) => item.id !== id);
      next[targetStatus] = [
        { ...task, status: targetStatus },
        ...next[targetStatus],
      ];
      return next;
    });

    try {
      await updateMutation.mutateAsync({ id, status: targetStatus });
      toast({
        title: "Đã cập nhật trạng thái",
        description: `"${task.name}" chuyển sang ${TASK_COLUMN_META[targetStatus].title}.`,
      });
    } catch {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  };

  const onCreateSubmit = form.handleSubmit(async (values) => {
    if (!selectedProjectId) {
      toast({
        title: "Chưa chọn dự án",
        description: "Vui lòng chọn dự án trước khi tạo công việc.",
        variant: "destructive",
      });
      return;
    }

    const projectIdCandidate =
      typeof projectDetailId === "number"
        ? projectDetailId
        : Number(selectedProjectId);

    if (!Number.isFinite(projectIdCandidate) || projectIdCandidate <= 0) {
      toast({
        title: "Dự án không hợp lệ",
        description: "Không xác định được dự án để gán công việc.",
        variant: "destructive",
      });
      return;
    }

    const projectId = Number(projectIdCandidate);

    const assignedToId =
      typeof values.assignedToId === "number" &&
      Number.isFinite(values.assignedToId)
        ? values.assignedToId
        : undefined;

    const milestoneId =
      typeof values.milestoneId === "number" &&
      Number.isFinite(values.milestoneId)
        ? values.milestoneId
        : undefined;

    const deadlineInput = values.deadline?.trim();
    const normalizedDeadline = deadlineInput
      ? `${deadlineInput}T00:00:00.000Z`
      : undefined;

    if (editTaskId && editTask) {
      const updatePayload = {
        id: editTaskId,
        name: values.name,
        description: values.description ?? undefined,
        assignedToId,
        ...(milestoneId != null ? { milestoneId } : {}),
        deadline: normalizedDeadline,
      };
      await updateMutation.mutateAsync(updatePayload);
    } else {
      const createPayload: CreateTaskRequest = {
        projectId,
        name: values.name,
        description: values.description ?? undefined,
        assignedToId,
        ...(milestoneId != null ? { milestoneId } : {}),
        deadline: normalizedDeadline,
      };
      await createMutation.mutateAsync(createPayload);
    }
  });

  const handleAssignMember = async () => {
    if (!activeTask?.id) {
      toast({
        title: "Không xác định được công việc",
        description: "Vui lòng đóng và mở lại chi tiết công việc.",
        variant: "destructive",
      });
      return;
    }

    const trimmedValue = assignSelection.trim();
    const accountId = Number(trimmedValue);

    if (!trimmedValue || !Number.isFinite(accountId) || accountId <= 0) {
      toast({
        title: "Chưa chọn thành viên",
        description: "Vui lòng chọn thành viên trước khi phân công.",
        variant: "destructive",
      });
      return;
    }

    const selectedMember = memberOptions.find(
      (option) => option.value === String(accountId)
    );

    try {
      await assignTaskMutation.mutateAsync({
        taskId: activeTask.id,
        accountId,
      });
      await queryClient.invalidateQueries({
        queryKey: taskQueryKeys.item(activeTask.id),
      });

      toast({
        title: "Đã phân công",
        description: selectedMember
          ? `"${activeTask.name}" được giao cho ${selectedMember.label}.`
          : "Đã cập nhật người phụ trách.",
      });
    } catch (error: unknown) {
      toast({
        title: "Không thể phân công",
        description: getErrorMessage(error, "Vui lòng thử lại sau."),
        variant: "destructive",
      });
    }
  };

  const content = (
    <>
      <div className="space-y-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <ClipboardList className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Quản lý công việc
                </h1>
                <p className="text-sm text-muted-foreground">
                  Theo dõi tiến độ, phân công và hạn xử lý của từng hạng mục.
                </p>
              </div>
            </div>
          </div>
        </header>
        <ProjectSelectCard
          selectedProjectId={selectedProjectId}
          onValueChange={setSelectedProjectId}
          onProjectChange={setSelectedProject}
          selectedProject={selectedProject}
          title="Chọn bảng dự án"
          description="Chọn dự án để xem và quản lý các công việc liên quan"
          placeholder="Chọn dự án để quản lý công việc"
          icon={Milestone}
          triggerRef={selectTriggerRef}
          actionButtons={
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching || projectDetailId == null}
                className="h-11 w-11 border-2 border-white/60 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:border-blue-300/60 transition-all"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isFetching && "animate-spin")}
                />
              </Button>
              <Button
                onClick={() => setOpen(true)}
                disabled={projectDetailId == null}
                className="h-11 bg-primary hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed px-6"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Tạo công việc
              </Button>
            </>
          }
        />
        <TaskFilters
          memberFilter={memberFilter}
          milestoneFilter={milestoneFilter}
          onMemberFilterChange={setMemberFilter}
          onMilestoneFilterChange={setMilestoneFilter}
          isFilterDisabled={isFilterDisabled}
          memberOptions={memberOptions}
          milestoneOptions={milestoneOptions}
          isProjectMembersLoading={isProjectMembersLoading}
          isProjectDetailError={isProjectDetailError}
          projectMembersErrorMessage={projectMembersErrorMessage}
          isMilestoneSelectLoading={isMilestoneSelectLoading}
          isProjectMilestonesError={isProjectMilestonesError}
          projectMilestonesErrorMessage={projectMilestonesErrorMessage}
        />
        <TaskBoard
          board={visibleBoard}
          isLoading={isLoading}
          projectDetailId={projectDetailId}
          onTaskSelect={handleTaskSelect}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      </div>

      <TaskDetailDialog
        open={detailOpen}
        onOpenChange={handleTaskDetailClose}
        task={activeTask}
        isLoading={isTaskDetailPending}
        isError={isTaskDetailError}
        errorMessage={taskDetailErrorMessage}
        memberOptions={memberOptions}
        isProjectMembersLoading={isProjectMembersLoading}
        isProjectDetailError={isProjectDetailError}
        projectMembersErrorMessage={projectMembersErrorMessage}
        assignSelection={assignSelection}
        onAssignSelectionChange={setAssignSelection}
        onAssignMember={handleAssignMember}
        isAssigning={assignTaskMutation.isPending}
        onEdit={handleEditTask}
        onDelete={() => setDeleteConfirmOpen(true)}
        isDeleting={deleteTaskMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        task={activeTask}
        onConfirm={() => {
          if (activeTaskId) {
            deleteTaskMutation.mutate(activeTaskId);
          }
        }}
        isDeleting={deleteTaskMutation.isPending}
      />

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setEditTaskId(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl p-0 overflow-hidden">
          <div className="sticky top-0 z-10 border-b border-blue-600/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-8 py-6 shadow-lg">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-semibold text-white">
                    {editTaskId ? "Sửa công việc" : "Tạo công việc mới"}
                  </DialogTitle>
                  <DialogDescription className="text-blue-100 mt-1">
                    {editTaskId
                      ? "Cập nhật thông tin công việc"
                      : "Thêm công việc mới vào dự án của bạn"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={onCreateSubmit} className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Tên công việc
                  </label>
                  <Input
                    placeholder="Nhập tiêu đề công việc"
                    {...form.register("name")}
                    className="h-14 text-base border-2 border-border/60 bg-background/50 rounded-lg px-4 transition-all hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <span className="text-xs">•</span>
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Mô tả
                  </label>
                  <Controller
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Thông tin chi tiết, link tài liệu..."
                        className="rounded-lg"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Milestone className="h-4 w-4 text-primary" />
                    Gắn tiến độ
                  </label>
                  <Controller
                    control={form.control}
                    name="milestoneId"
                    render={({ field }) => (
                      <Select
                        value={
                          field.value != null ? String(field.value) : "__none"
                        }
                        onValueChange={(value) => {
                          if (value === "__none") {
                            field.onChange(undefined);
                            return;
                          }

                          const nextValue = Number(value);
                          field.onChange(
                            Number.isFinite(nextValue) ? nextValue : undefined
                          );
                        }}
                        disabled={!selectedProjectId}
                      >
                        <SelectTrigger className="h-11 w-full items-center gap-3 text-base border-2 border-border/60 bg-background/50 rounded-lg px-4 transition-all hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10">
                          <div className="flex w-full items-center gap-3 text-left">
                            <Milestone className="h-4 w-4 text-primary flex-shrink-0" />
                            <SelectValue
                              placeholder={
                                !selectedProjectId
                                  ? "Chọn dự án trước"
                                  : isProjectMilestonesError
                                  ? "Không thể tải tiến độ"
                                  : isProjectMilestonesLoading
                                  ? "Đang tải tiến độ..."
                                  : projectMilestones.length === 0
                                  ? "Chưa có tiến độ"
                                  : "Chọn tiến độ"
                              }
                              className="flex-1 truncate text-left"
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="__none">
                            <div className="flex items-center gap-2 text-left">
                              <span>Không gắn tiến độ</span>
                            </div>
                          </SelectItem>
                          {isProjectMilestonesError ? (
                            <SelectItem value="__error" disabled>
                              {projectMilestonesErrorMessage}
                            </SelectItem>
                          ) : isProjectMilestonesLoading ? (
                            <SelectItem value="__loading" disabled>
                              Đang tải...
                            </SelectItem>
                          ) : projectMilestones.length === 0 ? (
                            <SelectItem value="__noMilestones" disabled>
                              Chưa có tiến độ
                            </SelectItem>
                          ) : (
                            projectMilestones.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                <div className="flex max-w-[400px] flex-col gap-1 text-left">
                                  <span className="truncate text-sm font-medium text-foreground">
                                    {m.description?.trim() || `Tiến độ ${m.id}`}
                                  </span>
                                  {m.dueDate ? (
                                    <span className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground">
                                      <CalendarDays className="h-3 w-3" />
                                      Hạn: {formatDateDisplay(m.dueDate)}
                                    </span>
                                  ) : null}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <UserRound className="h-4 w-4 text-primary" />
                    Phân công cho
                  </label>
                  <Controller
                    control={form.control}
                    name="assignedToId"
                    render={({ field }) => (
                      <Select
                        value={
                          field.value != null
                            ? String(field.value)
                            : "__unassigned"
                        }
                        onValueChange={(value) => {
                          if (value === "__unassigned") {
                            field.onChange(undefined);
                            return;
                          }

                          const nextValue = Number(value);
                          field.onChange(
                            Number.isFinite(nextValue) ? nextValue : undefined
                          );
                        }}
                        disabled={!selectedProjectId}
                      >
                        <SelectTrigger className="h-11 w-full text-base border-2 border-border/60 bg-background/50 rounded-lg px-4 transition-all hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm">
                          <SelectValue
                            placeholder={
                              !selectedProjectId
                                ? "Chọn dự án trước"
                                : isProjectDetailError
                                ? "Không thể tải thành viên"
                                : isProjectMembersLoading
                                ? "Đang tải thành viên..."
                                : memberOptions.length === 0
                                ? "Chưa có thành viên"
                                : "Chọn thành viên"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="__unassigned">
                            Không phân công
                          </SelectItem>
                          {isProjectDetailError ? (
                            <SelectItem value="__error" disabled>
                              {projectMembersErrorMessage}
                            </SelectItem>
                          ) : isProjectMembersLoading ? (
                            <SelectItem value="__loading" disabled>
                              Đang tải thành viên...
                            </SelectItem>
                          ) : memberOptions.length === 0 ? (
                            <SelectItem value="__noMembers" disabled>
                              Chưa có thành viên
                            </SelectItem>
                          ) : (
                            memberOptions.map((member) => {
                              const roleBadgeColor =
                                member.role === "Owner" ||
                                member.role?.toLowerCase() === "owner"
                                  ? "bg-purple-100 text-purple-700 border-purple-200"
                                  : member.role === "Lecturer" ||
                                    member.role?.toLowerCase() === "lecturer"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200";

                              return (
                                <SelectItem
                                  key={member.value}
                                  value={member.value}
                                >
                                  <div className="flex max-w-[400px] flex-col gap-1.5 text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate text-sm font-medium text-foreground">
                                        {member.label}
                                      </span>
                                      {member.role && (
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] px-1.5 py-0 h-5 font-semibold ${roleBadgeColor}`}
                                        >
                                          {member.role}
                                        </Badge>
                                      )}
                                    </div>
                                    {member.description ? (
                                      <span className="truncate text-xs text-muted-foreground">
                                        {member.description}
                                      </span>
                                    ) : null}
                                  </div>
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Hạn hoàn thành
                  </label>
                  <Controller
                    control={form.control}
                    name="deadline"
                    render={({ field }) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return (
                        <>
                          <DatePicker
                            value={field.value}
                            onChange={(value) => field.onChange(value ?? "")}
                            onBlur={field.onBlur}
                            placeholder="Chọn hạn xử lý"
                            fromDate={today}
                            className="h-14 text-base border-2 border-border/60 bg-background/50 rounded-lg px-4 transition-all hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
                          />
                          {form.formState.errors.deadline && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.deadline.message}
                            </p>
                          )}
                        </>
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 mt-6 border-t border-border/50 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditTaskId(null);
                  form.reset();
                }}
                className="h-12 px-6 text-base border-2 border-border/60 hover:bg-muted/50"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-12 px-6 text-base bg-primary hover:bg-primary/90 text-white transition-all shadow-md hover:shadow-lg"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editTaskId ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : editTaskId ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Tạo công việc
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );

  if (LayoutComponent) {
    return <LayoutComponent>{content}</LayoutComponent>;
  }

  return content;
}

export default function StudentTasks() {
  return <TasksPageContent />;
}
