import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScoringProgressDto } from "@/services/dean-stats";
import { CheckCircle2, Clock } from "lucide-react";

interface DeanScoringProgressProps {
  data?: ScoringProgressDto;
  isLoading?: boolean;
}

export function DeanScoringProgress({
  data,
  isLoading,
}: DeanScoringProgressProps) {
  if (isLoading) {
    return (
      <Card
        className="overflow-hidden opacity-0 animate-fade-in-up"
        style={{
          animationDelay: "300ms",
          animationFillMode: "forwards",
        }}
      >
        <CardHeader>
          <CardTitle>Tiến độ chấm điểm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tiến độ chấm điểm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressValue = Math.round(data.progressPercentage);

  return (
    <Card
      className="overflow-hidden opacity-0 animate-fade-in-up"
      style={{
        animationDelay: "300ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader>
        <CardTitle>Tiến độ chấm điểm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tổng số dự án</span>
            <span className="text-sm font-bold">{data.total}</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Đã chấm</span>
            </div>
            <span className="text-sm font-bold text-green-600">
              {data.scored}
            </span>
          </div>
          <Progress value={progressValue} className="h-3" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Còn lại</span>
            </div>
            <span className="text-sm font-bold text-orange-600">
              {data.remaining}
            </span>
          </div>
          <Progress value={100 - progressValue} className="h-3" />
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tỷ lệ hoàn thành</span>
            <span className="font-bold text-lg">{progressValue}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
