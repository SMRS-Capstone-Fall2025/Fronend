import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateDisplay } from "@/lib/date-utils";
import { TASK_COLUMN_META, TASK_STATUS_STYLES } from "@/lib/task-board";
import type { TaskDto, TaskStatus } from "@/services/types/task";
import {
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Clock,
  Loader2,
  Milestone,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { InfoCard } from "./info-card";
import { TaskDetailSkeleton } from "./task-detail-skeleton";
import { getInitials } from "./task-utils";
import type { ProjectMemberOption } from "./types";

type TaskDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number | null;
  task: TaskDto | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  memberOptions: ProjectMemberOption[];
  isProjectMembersLoading: boolean;
  isProjectDetailError: boolean;
  projectMembersErrorMessage: string;
  assignSelection: string;
  onAssignSelectionChange: (value: string) => void;
  onAssignMember: () => void;
  isAssigning: boolean;
  onEdit: (task: TaskDto) => void;
  onDelete: () => void;
  isDeleting: boolean;
};

export function TaskDetailDialog({
  open,
  onOpenChange,
  taskId,
  task,
  isLoading,
  isError,
  errorMessage,
  memberOptions,
  isProjectMembersLoading,
  isProjectDetailError,
  projectMembersErrorMessage,
  assignSelection,
  onAssignSelectionChange,
  onAssignMember,
  isAssigning,
  onEdit,
  onDelete,
  isDeleting,
}: TaskDetailDialogProps) {
  const statusStyles = TASK_STATUS_STYLES;
  const columnMeta = TASK_COLUMN_META;

  const taskStatus = task?.status ?? null;
  const isKnownTaskStatus =
    taskStatus != null &&
    Object.prototype.hasOwnProperty.call(statusStyles, taskStatus);
  const taskStatusMeta = isKnownTaskStatus
    ? columnMeta[taskStatus as TaskStatus]
    : null;

  const deadlineLabel = formatDateDisplay(task?.deadline);
  const startLabel = formatDateDisplay(task?.startDate);
  const milestoneLabel = task?.milestoneName?.trim() ?? null;
  const description = task?.description?.trim() ?? null;
  const assigneeId =
    task?.assignedTo?.id != null ? String(task.assignedTo.id) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <div className="flex flex-col">
          <div className="sticky top-0 z-10 border-b border-blue-600/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-6 py-5 shadow-lg">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-24 bg-white/20" />
                <Skeleton className="h-7 w-3/4 bg-white/20" />
                <Skeleton className="h-4 w-1/2 bg-white/20" />
              </div>
            ) : task ? (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {task?.id ? (
                          <span className="text-xs font-medium uppercase text-blue-100">
                            Mã #{task.id}
                          </span>
                        ) : null}
                        {deadlineLabel ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                            <CalendarDays className="h-3 w-3" />
                            {deadlineLabel}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="text-xl font-semibold leading-7 text-white">
                        {task.name}
                      </h2>
                      {milestoneLabel ? (
                        <p className="text-sm text-blue-100">
                          Gắn với mốc {milestoneLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Chi tiết công việc
                    </h2>
                    <p className="text-sm text-blue-100">
                      Không tìm thấy thông tin công việc.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ScrollArea className="max-h-[70vh] px-6">
            <div className="space-y-6 py-6">
              {isLoading ? (
                <TaskDetailSkeleton />
              ) : isError ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : task ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoCard
                      icon={CalendarDays}
                      label="Hạn hoàn thành"
                      value={deadlineLabel ?? "Chưa có hạn"}
                      helper={deadlineLabel ? undefined : "Chưa được đặt hạn"}
                    />
                    <InfoCard
                      icon={Clock}
                      label="Ngày bắt đầu"
                      value={startLabel ?? "Chưa xác định"}
                      helper={startLabel ? undefined : "Chưa có lịch bắt đầu"}
                    />
                    <InfoCard
                      icon={Milestone}
                      label="Báo cáo"
                      value={milestoneLabel ?? "Chưa gắn mốc"}
                    />
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/90 p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
                      <UserRound className="h-3.5 w-3.5" />
                      <span>Người phụ trách</span>
                    </div>
                    {task.assignedTo ? (
                      <div className="mt-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-border/60">
                          <AvatarFallback>
                            {getInitials(task.assignedTo.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-foreground">
                            {task.assignedTo.name}
                          </p>
                          {task.assignedTo.id ? (
                            <p className="text-xs text-muted-foreground">
                              ID: {task.assignedTo.id}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-[11px] font-semibold uppercase text-amber-700">
                        Chưa phân công
                      </div>
                    )}

                    <div className="mt-6 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Phân công / chuyển giao
                      </p>
                      {isProjectDetailError ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                          {projectMembersErrorMessage}
                        </div>
                      ) : isProjectMembersLoading ? (
                        <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Đang tải danh sách thành viên...</span>
                        </div>
                      ) : memberOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Dự án chưa có thành viên nào để phân công.
                        </p>
                      ) : (
                        <>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Select
                              value={assignSelection || undefined}
                              onValueChange={onAssignSelectionChange}
                              disabled={isAssigning}
                            >
                              <SelectTrigger className="h-11 flex-1">
                                <SelectValue placeholder="Chọn thành viên" />
                              </SelectTrigger>
                              <SelectContent>
                                {memberOptions.map((member) => {
                                  const roleBadgeColor =
                                    member.role === "Owner" ||
                                    member.role?.toLowerCase() === "owner"
                                      ? "bg-purple-100 text-purple-700 border-purple-200"
                                      : member.role === "Lecturer" ||
                                        member.role?.toLowerCase() ===
                                          "lecturer"
                                      ? "bg-blue-100 text-blue-700 border-blue-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200";

                                  return (
                                    <SelectItem
                                      key={member.value}
                                      value={member.value}
                                    >
                                      <div className="flex max-w-[240px] flex-col gap-1.5 text-left">
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
                                          <span className="truncate text-[10px] leading-tight text-muted-foreground">
                                            {member.description}
                                          </span>
                                        ) : null}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              onClick={onAssignMember}
                              disabled={
                                !assignSelection ||
                                assignSelection === assigneeId ||
                                isAssigning
                              }
                              className="sm:w-auto"
                            >
                              {isAssigning ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Đang phân công...
                                </>
                              ) : (
                                "Phân công"
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/80 p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>Mô tả</span>
                    </div>
                    <Separator className="my-3 opacity-40" />
                    {description ? (
                      <div
                        className="prose prose-sm max-w-none text-sm leading-6 text-muted-foreground [&_*]:text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                        dangerouslySetInnerHTML={{
                          __html: description,
                        }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Chưa có mô tả
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/90 p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Thông tin bổ sung</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {task.createdBy ? (
                        <p>
                          Tạo bởi
                          <span className="ml-1 font-medium text-foreground">
                            {task.createdBy.name ?? "Không rõ"}
                          </span>
                          {task.createdBy.id ? (
                            <span className="text-xs text-muted-foreground/80">
                              {" "}
                              (ID: {task.createdBy.id})
                            </span>
                          ) : null}
                        </p>
                      ) : (
                        <p>Không rõ người tạo.</p>
                      )}
                      <p>
                        Trạng thái hiện tại:
                        <span className="ml-1 font-medium text-foreground">
                          {taskStatusMeta?.title ?? "Chưa xác định"}
                        </span>
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Không tìm thấy thông tin công việc.
                </div>
              )}
            </div>
          </ScrollArea>
          {task && (
            <DialogFooter className="border-t px-6 py-4">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onEdit(task);
                      onOpenChange(false);
                    }}
                    disabled={isDeleting}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa công việc
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                >
                  Đóng
                </Button>
              </div>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
