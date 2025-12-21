import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderKanban,
  Crown,
  CheckCircle2,
  Award,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudentOverviewDto } from "@/services/student-stats";

interface StudentOverviewCardsProps {
  data?: StudentOverviewDto;
  isLoading?: boolean;
}

export function StudentOverviewCards({
  data,
  isLoading,
}: StudentOverviewCardsProps) {
  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      title: "Dự án của tôi",
      value: data.myProjects.toLocaleString("vi-VN"),
      icon: FolderKanban,
      growth: data.projectsGrowth,
      iconColor: "text-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      delay: 0,
    },
    {
      title: "Làm trưởng nhóm",
      value: data.projectsAsOwner.toLocaleString("vi-VN"),
      icon: Crown,
      growth: data.ownerGrowth,
      iconColor: "text-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      delay: 100,
    },
    {
      title: "Đã hoàn thành",
      value: data.completedProjects.toLocaleString("vi-VN"),
      icon: CheckCircle2,
      growth: data.completedGrowth,
      iconColor: "text-green-600",
      bgGradient: "from-green-50 to-green-100/50",
      borderColor: "border-green-200",
      iconBg: "bg-green-100",
      delay: 200,
    },
    {
      title: "Điểm trung bình",
      value: data.averageScore > 0 ? data.averageScore.toFixed(2) : "0.00",
      icon: Award,
      growth: data.scoreGrowth,
      iconColor: "text-orange-600",
      bgGradient: "from-orange-50 to-orange-100/50",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-100",
      delay: 300,
    },
  ];

  const parseGrowth = (growth?: string | null) => {
    if (!growth) return null;
    const match = growth.match(/([+-]?[\d.]+)%/);
    if (!match) return null;
    const value = parseFloat(match[1]);
    return {
      value: Math.abs(value),
      isPositive: value >= 0,
    };
  };

  return (
    <>
      {cards.map((card) => {
        const Icon = card.icon;
        const growth = parseGrowth(card.growth);

        return (
          <Card
            key={card.title}
            className={`relative overflow-hidden border-2 ${card.borderColor} bg-gradient-to-br ${card.bgGradient} transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 opacity-0 animate-fade-in-up min-w-0`}
            style={{
              animationDelay: `${card.delay}ms`,
              animationFillMode: "forwards",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium truncate flex-1 min-w-0">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg ${card.iconBg} p-2 flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-2xl font-bold truncate">{card.value}</div>
              {growth && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 flex-wrap">
                  {growth.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 flex-shrink-0" />
                  )}
                  <span
                    className={
                      growth.isPositive ? "text-green-600" : "text-red-600"
                    }
                  >
                    {growth.value.toFixed(1)}%
                  </span>
                  <span className="whitespace-nowrap">so với kỳ trước</span>
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
