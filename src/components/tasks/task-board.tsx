import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TASK_COLUMN_META,
  TASK_STATUS_ORDER,
  TASK_STATUS_STYLES,
} from "@/lib/task-board";
import { cn } from "@/lib/utils";
import type { TaskDto, TaskStatus } from "@/services/types/task";
import { ClipboardList, Loader2 } from "lucide-react";
import { TaskCard } from "./task-card";

const columnMeta = TASK_COLUMN_META;
const STATUS_ORDER = TASK_STATUS_ORDER;
const statusStyles = TASK_STATUS_STYLES;

type TaskBoardProps = {
  board: Record<TaskStatus, TaskDto[]>;
  isLoading: boolean;
  projectDetailId: string | number | null;
  onTaskSelect: (task: TaskDto) => void;
  onDragStart: (event: React.DragEvent, taskId: number | undefined) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent, targetStatus: TaskStatus) => void;
};

export function TaskBoard({
  board,
  isLoading,
  projectDetailId,
  onTaskSelect,
  onDragStart,
  onDragOver,
  onDrop,
}: TaskBoardProps) {
  return (
    <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-3 min-h-[500px]">
      {projectDetailId == null && (
        <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-slate-50/95 via-white/90 to-slate-50/80 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/50 p-8 text-center backdrop-blur-sm border-2 border-dashed border-border/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ClipboardList className="h-8 w-8 text-primary/60" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              Vui lòng chọn dự án trước khi thao tác
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Bấm vào "Chọn bảng dự án" ở trên để tiếp tục.
            </p>
          </div>
        </div>
      )}
      {STATUS_ORDER.map((status) => (
        <div key={status} className="flex flex-col">
          <Card className="border-2 h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-base font-bold mb-1",
                      statusStyles[status].columnLabel
                    )}
                  >
                    {columnMeta[status].title}
                  </h3>
                  <p
                    className={cn(
                      "text-xs",
                      statusStyles[status].columnDescription
                    )}
                  >
                    {columnMeta[status].description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-bold h-7 px-3 rounded-full",
                    statusStyles[status].badge
                  )}
                >
                  {board[status]?.length ?? 0}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-4">
              <div
                onDragOver={onDragOver}
                onDrop={(event) => onDrop(event, status)}
                className={cn(
                  "min-h-[400px] rounded-xl border-2 border-dashed p-4 transition-all h-full",
                  statusStyles[status].columnSurface,
                  "hover:border-primary/40"
                )}
              >
                <ScrollArea className="h-[calc(100vh-420px)] pr-3">
                  <div className="space-y-3">
                    {(board[status] ?? []).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, task.id)}
                        className="cursor-move"
                      >
                        <TaskCard task={task} onSelect={onTaskSelect} />
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Đang tải dữ liệu...</span>
                        </div>
                      </div>
                    )}
                    {!isLoading && (board[status] ?? []).length === 0 && (
                      <div className="flex h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-background/40 text-center p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                          <ClipboardList className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Không có công việc
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Kéo thả hoặc tạo mới để bắt đầu.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
