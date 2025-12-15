import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScoreComparisonDto } from "@/services/student-stats";
import { Award, TrendingUp, Users } from "lucide-react";

interface StudentScoreComparisonWidgetProps {
  data?: ScoreComparisonDto;
  isLoading?: boolean;
}

export function StudentScoreComparisonWidget({
  data,
  isLoading,
}: StudentScoreComparisonWidgetProps) {
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
          <CardTitle>So sánh điểm số</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>So sánh điểm số</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentileNumber = data.percentile
    ? parseFloat(data.percentile.replace("%", ""))
    : 0;
  const topPercent = 100 - percentileNumber;

  return (
    <Card
      className="overflow-hidden opacity-0 animate-fade-in-up"
      style={{
        animationDelay: "600ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader>
        <CardTitle>So sánh điểm số</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">
                Điểm trung bình của tôi
              </span>
            </div>
            <span className="text-lg font-bold">
              {data.myAverageScore.toFixed(2)}
            </span>
          </div>
          <Progress value={(data.myAverageScore / 10) * 100} className="h-3" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Trung bình lớp</span>
            </div>
            <span className="text-lg font-bold">
              {data.classAverageScore.toFixed(2)}
            </span>
          </div>
          <Progress
            value={(data.classAverageScore / 10) * 100}
            className="h-3"
          />
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Xếp hạng</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-bold text-lg">#{data.ranking}</span>
              <span className="text-sm text-muted-foreground">
                / {data.totalStudents}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Top {topPercent.toFixed(1)}%
              </span>
              <span className="font-semibold">{data.percentile}</span>
            </div>
            <Progress value={topPercent} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
