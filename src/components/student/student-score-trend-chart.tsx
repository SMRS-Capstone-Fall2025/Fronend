import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScoreTrendDto } from "@/services/student-stats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const chartConfig = {
  myScores: {
    label: "Điểm của tôi",
    color: "#3b82f6",
  },
  classAverage: {
    label: "Trung bình lớp",
    color: "#10b981",
  },
};

export function StudentScoreTrendChart({
  data,
  isLoading,
}: {
  data?: ScoreTrendDto;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card
        className="overflow-hidden opacity-0 animate-fade-in-up"
        style={{
          animationDelay: "400ms",
          animationFillMode: "forwards",
        }}
      >
        <CardHeader>
          <CardTitle>Xu hướng điểm số</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng điểm số</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = (data.labels || []).map((label, index) => ({
    project: label,
    myScore: data.myScores?.[index] ?? 0,
    classAverage: data.classAverage?.[index] ?? 0,
  }));

  return (
    <Card
      className="overflow-hidden opacity-0 animate-fade-in-up"
      style={{
        animationDelay: "400ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle>Xu hướng điểm số</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="w-full overflow-x-auto">
          <ChartContainer
            config={chartConfig}
            className="h-[300px] w-full min-w-[500px] min-h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="project"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                  width={50}
                  domain={[0, 10]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent className="shadow-lg" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="myScore"
                  stroke="var(--color-myScores)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-myScores)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="classAverage"
                  stroke="var(--color-classAverage)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-classAverage)", r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
