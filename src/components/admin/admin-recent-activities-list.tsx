import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityDto } from "@/services/admin-stats";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

interface AdminRecentActivitiesListProps {
  data?: readonly ActivityDto[];
  isLoading?: boolean;
}

const ACTIVITY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  project_created: FileText,
  project_submitted: FileText,
  project_approved: CheckCircle2,
  project_rejected: XCircle,
  member_added: UserPlus,
  comment_added: MessageSquare,
  default: Clock,
};

export function AdminRecentActivitiesList({
  data,
  isLoading,
}: AdminRecentActivitiesListProps) {

  const displayData = data ? data.slice(0, 5) : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
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
            Không có hoạt động nào
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    const Icon =
      ACTIVITY_ICONS[type] ||
      ACTIVITY_ICONS[type.toLowerCase()] ||
      ACTIVITY_ICONS.default;
    return Icon;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Hoạt động gần đây</CardTitle>
          {data && data.length > 5 && (
            <Button variant="link" className="p-0">
              <Link to="/admin/activities">Xem thêm</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 mt-2">
        <div className="space-y-4">
          {displayData.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);

            return (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0"
              >
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  {activity.projectName && (
                    <p className="text-xs text-muted-foreground">
                      Dự án: {activity.projectName}
                    </p>
                  )}
                  {activity.userName && (
                    <p className="text-xs text-muted-foreground">
                      Bởi: {activity.userName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
