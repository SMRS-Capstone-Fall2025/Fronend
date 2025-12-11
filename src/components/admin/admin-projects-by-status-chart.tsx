import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface AdminProjectsByStatusChartProps {
  data?: Record<string, number>;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Approved: "#10b981",
  Rejected: "#ef4444",
  InProgress: "#3b82f6",
  Completed: "#8b5cf6",
  Cancelled: "#6b7280",
  Archived: "#9ca3af",
};

const STATUS_LABELS: Record<string, string> = {
  Pending: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Từ chối",
  InProgress: "Đang thực hiện",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
  Archived: "Đã lưu trữ",
};

const chartConfig = Object.entries(STATUS_COLORS).reduce(
  (acc, [key, color]) => ({
    ...acc,
    [key.toLowerCase()]: {
      label: STATUS_LABELS[key] || key,
      color,
    },
  }),
  {} as Record<string, { label: string; color: string }>
);

export function AdminProjectsByStatusChart({
  data,
  isLoading,
}: AdminProjectsByStatusChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bố dự án theo trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[240px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bố dự án theo trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[240px] text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([key, value]) => {

    const normalizedKey =
      Object.keys(STATUS_COLORS).find(
        (k) => k.toLowerCase() === key.toLowerCase()
      ) || key;

    return {
      name: STATUS_LABELS[normalizedKey] || STATUS_LABELS[key] || key,
      value: Number(value),
      fill: STATUS_COLORS[normalizedKey] || STATUS_COLORS[key] || "#6b7280",
    };
  });

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố dự án theo trạng thái</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0];
                  const percentage =
                    total > 0 ? ((data.value as number) / total) * 100 : 0;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {data.name}
                          </span>
                          <span className="text-sm font-bold">
                            {data.value?.toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% tổng số
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) =>
                  percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                }
                outerRadius={100}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div
                key={index}
                className="flex items-center gap-2 text-xs"
              >
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium text-foreground">
                  ({item.value.toLocaleString("vi-VN")} - {percentage.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
