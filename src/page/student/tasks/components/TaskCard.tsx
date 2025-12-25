import type { KeyboardEvent } from "react";
import { CalendarClock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateDisplay } from "@/lib/date-utils";
import type { TaskDto } from "@/services/types/task";

const getInitials = (value?: string | null) => {
  if (!value) return "NV";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NV";
  if (parts.length === 1) {
    const [first] = parts;
    return first.slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0];
  const last = parts[parts.length - 1]?.[0];
  return `${first ?? ""}${last ?? ""}`.toUpperCase();
};

type TaskCardProps = {
  readonly task: TaskDto;
  readonly onSelect?: (task: TaskDto) => void;
};

export function TaskCard({ task, onSelect }: TaskCardProps) {
  const deadlineLabel = formatDateDisplay(task.deadline) ?? "Chưa có hạn";
  const assignedName = task.assignedTo?.name?.trim() ?? null;
  const assignedInitials = getInitials(assignedName);
  const milestoneLabel = task.milestoneName?.trim() ?? null;

  const handleSelect = () => {
    if (!onSelect) return;
    onSelect(task);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className="border-border/70 bg-background shadow-none transition hover:border-primary/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 cursor-pointer"
    >
      <CardHeader className="space-y-3 p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-sm leading-5 text-foreground">
              {task.name}
            </CardTitle>
          </div>
        </div>
        {task.description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          <span>{deadlineLabel}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {milestoneLabel ? (
              <span className="truncate text-[11px] font-medium uppercase text-muted-foreground/80">
                {milestoneLabel}
              </span>
            ) : (
              <span className="text-[11px] italic text-muted-foreground/70">
                Chưa gắn mốc
              </span>
            )}
          </div>
          {assignedName ? (
            <div className="flex max-w-[150px] items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm">
              <Avatar className="h-6 w-6 border border-border/60">
                <AvatarFallback>{assignedInitials}</AvatarFallback>
              </Avatar>
              <span className="truncate">{assignedName}</span>
            </div>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full border-amber-300 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase text-amber-700"
            >
              Chưa phân công
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

