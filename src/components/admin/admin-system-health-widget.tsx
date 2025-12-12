import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SystemHealthDto } from "@/services/admin-stats";
import { Activity, Clock, HardDrive, Server } from "lucide-react";

interface AdminSystemHealthWidgetProps {
  data?: SystemHealthDto;
  isLoading?: boolean;
}

export function AdminSystemHealthWidget({
  data,
  isLoading,
}: AdminSystemHealthWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trạng thái hệ thống</span>
            <Skeleton className="h-6 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthItems = [
    {
      label: "Đang hoạt động",
      value: data.activeUsers.toLocaleString("vi-VN"),
      icon: Activity,
      color: "text-blue-600",
    },
    {
      label: "Thời gian phản hồi",
      value: data.responseTime,
      icon: Clock,
      color: "text-green-600",
    },
    {
      label: "Uptime",
      value: data.uptime,
      icon: Server,
      color: "text-purple-600",
    },
    {
      label: "Dung lượng sử dụng",
      value: data.storageUsed,
      icon: HardDrive,
      color: "text-orange-600",
    },
  ];

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Trạng thái hệ thống</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 min-w-0 mt-6">
        {healthItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
                <span className="font-medium text-muted-foreground truncate">
                  {item.label}
                </span>
              </div>
              <p className="text-xl font-bold truncate">{item.value}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
