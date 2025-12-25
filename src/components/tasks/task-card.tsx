import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateDisplay } from "@/lib/date-utils";
import type { TaskDto } from "@/services/types/task";
import { CalendarClock, Clock } from "lucide-react";

interface TaskCardProps {
  task: TaskDto;
  onSelect: (task: TaskDto) => void;
}

export function TaskCard({ task, onSelect }: TaskCardProps) {
  const deadlineLabel = formatDateDisplay(task.deadline);
  const assigneeName = task.assignedTo?.name ?? null;
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((segment) => segment[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);
  };
  const assigneeInitials = assigneeName ? getInitials(assigneeName) : null;

  return (
    <Card
      className="group cursor-pointer border-2 border-border/60 bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
      onClick={() => onSelect(task)}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {task.name}
          </h3>
        </div>

        {task.description && (
          <div className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {task.description.replace(/<[^>]*>/g, "").substring(0, 120)}
            {task.description.length > 120 ? "..." : ""}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          {assigneeName ? (
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2 py-1">
              {assigneeInitials && (
                <Avatar className="h-5 w-5 border border-border/60">
                  <AvatarFallback className="text-[10px] font-semibold">
                    {assigneeInitials}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="truncate max-w-[100px] text-xs font-medium text-foreground">
                {assigneeName}
              </span>
            </div>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full border-amber-300/60 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700"
            >
              Chưa phân công
            </Badge>
          )}

          {deadlineLabel && (
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>{deadlineLabel}</span>
            </div>
          )}

          {task.milestoneId && task.milestoneName && (
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="truncate max-w-[100px]">{task.milestoneName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
