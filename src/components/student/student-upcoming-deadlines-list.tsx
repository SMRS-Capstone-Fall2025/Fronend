import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeadlineDto } from "@/services/student-stats";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertTriangle, Clock } from "lucide-react";

interface StudentUpcomingDeadlinesListProps {
  data?: readonly DeadlineDto[];
  isLoading?: boolean;
}

export function StudentUpcomingDeadlinesList({
  data,
  isLoading,
}: StudentUpcomingDeadlinesListProps) {
  if (isLoading) {
    return (
      <Card
        className="overflow-hidden opacity-0 animate-fade-in-up"
        style={{
          animationDelay: "800ms",
          animationFillMode: "forwards",
        }}
      >
        <CardHeader>
          <CardTitle>Deadline sắp tới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deadline sắp tới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Không có deadline
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDeadlineStatus = (daysLeft: number) => {
    if (daysLeft < 0) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        badge: <Badge variant="destructive">Quá hạn</Badge>,
        textColor: "text-red-600",
      };
    }
    if (daysLeft <= 3) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
        badge: (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-600"
          >
            Sắp hết hạn
          </Badge>
        ),
        textColor: "text-orange-600",
      };
    }
    return {
      icon: <Clock className="h-4 w-4 text-blue-600" />,
      badge: <Badge variant="outline">Sắp tới</Badge>,
      textColor: "text-blue-600",
    };
  };

  return (
    <Card
      className="overflow-hidden opacity-0 animate-fade-in-up"
      style={{
        animationDelay: "800ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader>
        <CardTitle>Deadline sắp tới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((deadline) => {
            const dueDate = new Date(deadline.dueDate);
            const status = getDeadlineStatus(deadline.daysLeft);

            return (
              <div
                key={`${deadline.projectId}-${deadline.milestone}`}
                className="flex gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 pt-1">{status.icon}</div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {deadline.projectName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {deadline.milestone}
                      </div>
                    </div>
                    {status.badge}
                  </div>
                  <div
                    className={`text-xs font-medium ${status.textColor} flex items-center gap-1`}
                  >
                    {deadline.daysLeft < 0 ? (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        <span>
                          Đã quá hạn {Math.abs(deadline.daysLeft)} ngày
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>Còn {deadline.daysLeft} ngày</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Hạn: {format(dueDate, "dd MMM yyyy, HH:mm", { locale: vi })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
