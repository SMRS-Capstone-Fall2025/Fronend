import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface DeanScoreDistributionChartProps {
  data?: Record<string, number>;
  isLoading?: boolean;
}

const SCORE_RANGES = [
  "0-4",
  "4-5",
  "5-6",
  "6-7",
  "7-8",
  "8-9",
  "9-10",
];

const chartConfig = {
  count: {
    label: "Số lượng",
    color: "#3b82f6",
  },
};

export function DeanScoreDistributionChart({
  data,
  isLoading,
}: DeanScoreDistributionChartProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden opacity-0 animate-fade-in-up"
        style={{
          animationDelay: "700ms",
          animationFillMode: "forwards",
        }}>
        <CardHeader>
          <CardTitle>Phân bố điểm đã chấm</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bố điểm đã chấm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = SCORE_RANGES.map((range) => ({
    range,
    count: data[range] ?? 0,
  }));

  const maxValue = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <Card className="overflow-hidden opacity-0 animate-fade-in-up"
      style={{
        animationDelay: "700ms",
        animationFillMode: "forwards",
      }}>
      <CardHeader className="pb-3">
        <CardTitle>Phân bố điểm đã chấm</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="w-full overflow-x-auto">
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
                  dataKey="range"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                  width={50}
                  domain={[0, maxValue]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent className="shadow-lg" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
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

