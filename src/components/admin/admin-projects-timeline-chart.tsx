import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { ProjectsTimelineDto } from "@/services/admin-stats";

interface AdminProjectsTimelineChartProps {
  data?: ProjectsTimelineDto;
  isLoading?: boolean;
}

const chartConfig = {
  created: {
    label: "Dự án tạo mới",
    color: "#3b82f6",
  },
  completed: {
    label: "Dự án hoàn thành",
    color: "#10b981",
  },
};

export function AdminProjectsTimelineChart({
  data,
  isLoading,
}: AdminProjectsTimelineChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng tạo/hoàn thành dự án</CardTitle>
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
          <CardTitle>Xu hướng tạo/hoàn thành dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    month: label,
    created: data.created[index] ?? 0,
    completed: data.completed[index] ?? 0,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>Xu hướng tạo/hoàn thành dự án</CardTitle>
      </CardHeader>
      <CardContent className="pb-4 mt-4">
        <div className="w-full overflow-x-hidden">
          <ChartContainer
            config={chartConfig}
            className="h-[300px] w-full min-w-[500px] min-h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="month"
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
                />
                <ChartTooltip
                  content={<ChartTooltipContent className="shadow-lg" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="created"
                  fill="var(--color-created)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
