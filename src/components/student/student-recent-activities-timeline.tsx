import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityDto } from "@/services/student-stats";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, FileText, Award, Clock } from "lucide-react";

interface StudentRecentActivitiesTimelineProps {
  data?: readonly ActivityDto[];
  isLoading?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "score":
    case "graded":
      return <Award className="h-5 w-5 text-green-600" />;
    case "submit":
    case "submission":
      return <FileText className="h-5 w-5 text-blue-600" />;
    default:
      return <CheckCircle2 className="h-5 w-5 text-muted-foreground" />;
  }
};

export function StudentRecentActivitiesTimeline({
  data,
  isLoading,
}: StudentRecentActivitiesTimelineProps) {
  if (isLoading) {
    return (
      <Card
        className="overflow-hidden opacity-0 animate-fade-in-up"
        style={{
          animationDelay: "700ms",
          animationFillMode: "forwards",
        }}
      >
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden opacity-0 animate-fade-in-up"
      style={{
        animationDelay: "700ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((activity, index) => {
            const timestamp = new Date(activity.timestamp);
            const isRecent = index < 3;

            return (
              <div
                key={`${activity.type}-${activity.timestamp}-${index}`}
                className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 pt-1">
                  {isRecent ? (
                    getActivityIcon(activity.type)
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-medium text-sm">
                    {activity.description}
                  </div>
                  {activity.projectName && (
                    <div className="text-xs text-muted-foreground">
                      Dự án: {activity.projectName}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {format(timestamp, "dd MMM yyyy, HH:mm", { locale: vi })}
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
