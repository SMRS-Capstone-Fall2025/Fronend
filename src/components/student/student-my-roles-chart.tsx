import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface StudentMyRolesChartProps {
  data?: Record<string, number>;
  isLoading?: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  Leader: "#8b5cf6",
  Member: "#3b82f6",
  Owner: "#10b981",
};

const ROLE_LABELS: Record<string, string> = {
  Leader: "Làm leader",
  Member: "Làm member",
  Owner: "Làm trưởng nhóm",
};

const chartConfig = Object.entries(ROLE_COLORS).reduce(
  (acc, [key, color]) => ({
    ...acc,
    [key.toLowerCase()]: {
      label: ROLE_LABELS[key] || key,
      color,
    },
  }),
  {} as Record<string, { label: string; color: string }>
);

export function StudentMyRolesChart({
  data,
  isLoading,
}: StudentMyRolesChartProps) {
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
          <CardTitle>Vai trò trong dự án</CardTitle>
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
          <CardTitle>Vai trò trong dự án</CardTitle>
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
      Object.keys(ROLE_COLORS).find(
        (k) => k.toLowerCase() === key.toLowerCase()
      ) || key;

    return {
      name: ROLE_LABELS[normalizedKey] || ROLE_LABELS[key] || key,
      value: Number(value),
      fill: ROLE_COLORS[normalizedKey] || ROLE_COLORS[key] || "#6b7280",
    };
  });

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      className="overflow-hidden opacity-0 animate-fade-in-up"
      style={{
        animationDelay: "300ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader>
        <CardTitle>Vai trò trong dự án</CardTitle>
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
      </CardContent>
    </Card>
  );
}
