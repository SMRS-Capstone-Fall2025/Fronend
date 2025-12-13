import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentScoreDto } from "@/services/dean-stats";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, Clock } from "lucide-react";

interface DeanRecentScoresTimelineProps {
  data?: readonly RecentScoreDto[];
  isLoading?: boolean;
}

export function DeanRecentScoresTimeline({
  data,
  isLoading,
}: DeanRecentScoresTimelineProps) {
  if (isLoading) {
    return (
      <Card
        className="overflow-hidden opacity-0 animate-fade-in-up"
        style={{
          animationDelay: "600ms",
          animationFillMode: "forwards",
        }}
      >
        <CardHeader>
          <CardTitle>Lịch sử chấm điểm gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
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
          <CardTitle>Lịch sử chấm điểm gần đây</CardTitle>
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
        animationDelay: "600ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader>
        <CardTitle>Lịch sử chấm điểm gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((score, index) => {
            const scoreDate = new Date(score.scoreDate);
            const isRecent = index < 3;

            return (
              <div
                key={score.scoreId}
                className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 pt-1">
                  {isRecent ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {score.projectName}
                      </div>
                      {score.councilName && (
                        <div className="text-xs text-muted-foreground">
                          Hội đồng: {score.councilName}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-lg">
                        {score.finalScore.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">điểm</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(scoreDate, "dd MMM yyyy, HH:mm", { locale: vi })}
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
