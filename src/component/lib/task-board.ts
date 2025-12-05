import type { TaskDto, TaskStatus } from "@/services/types/task";

export const TASK_COLUMN_META: Record<
  TaskStatus,
  { title: string; description: string; id: string }
> = {
  TO_DO: {
    title: "Chưa làm",
    description: "Các đầu việc cần bắt đầu",
    id: "todo",
  },
  IN_PROGRESS: {
    title: "Đang làm",
    description: "Các đầu việc đang triển khai",
    id: "in-progress",
  },
  DONE: {
    title: "Hoàn thành",
    description: "Các đầu việc đã hoàn tất",
    id: "done",
  },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ["TO_DO", "IN_PROGRESS", "DONE"];

type TaskStatusStyle = {
  readonly summaryCard: string;
  readonly summaryLabel: string;
  readonly summaryCount: string;
  readonly summaryDescription: string;
  readonly columnSurface: string;
  readonly columnLabel: string;
  readonly columnDescription: string;
  readonly badge: string;
};

export const TASK_STATUS_STYLES: Record<TaskStatus, TaskStatusStyle> = {
  TO_DO: {
    summaryCard: "border-sky-200/80 bg-sky-50/70",
    summaryLabel: "text-sky-600",
    summaryCount: "text-sky-900",
    summaryDescription: "text-sky-600/80",
    columnSurface: "border-sky-200 bg-sky-50/70",
    columnLabel: "text-sky-700",
    columnDescription: "text-sky-600/80",
    badge: "border-sky-300 bg-sky-100 text-sky-700",
  },
  IN_PROGRESS: {
    summaryCard: "border-amber-200/80 bg-amber-50/70",
    summaryLabel: "text-amber-600",
    summaryCount: "text-amber-900",
    summaryDescription: "text-amber-600/80",
    columnSurface: "border-amber-200 bg-amber-50/70",
    columnLabel: "text-amber-700",
    columnDescription: "text-amber-600/80",
    badge: "border-amber-300 bg-amber-100 text-amber-700",
  },
  DONE: {
    summaryCard: "border-emerald-200/80 bg-emerald-50/70",
    summaryLabel: "text-emerald-600",
    summaryCount: "text-emerald-900",
    summaryDescription: "text-emerald-600/80",
    columnSurface: "border-emerald-200 bg-emerald-50/70",
    columnLabel: "text-emerald-700",
    columnDescription: "text-emerald-600/80",
    badge: "border-emerald-300 bg-emerald-100 text-emerald-700",
  },
};

export const createEmptyTaskBoard = (): Record<TaskStatus, TaskDto[]> => ({
  TO_DO: [],
  IN_PROGRESS: [],
  DONE: [],
});

export const groupTasksByStatus = (
  tasks?: readonly TaskDto[] | null
): Record<TaskStatus, TaskDto[]> => {
  const grouped = createEmptyTaskBoard();
  const items = tasks ?? [];

  for (const task of items) {
    const rawStatus = task.status;
    const status = TASK_STATUS_ORDER.includes(rawStatus as TaskStatus)
      ? (rawStatus as TaskStatus) ?? "TO_DO"
      : "TO_DO";
    grouped[status].push(task);
  }

  return grouped;
};
