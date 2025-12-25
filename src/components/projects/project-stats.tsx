import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  ShieldAlertIcon,
  Sparkles,
  UsersIcon,
} from "lucide-react";

interface ProjectStat {
  label: string;
  value: number | string;
  helper?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
}

interface ProjectStatsProps {
  totalProjects: number;
  activeProjects: number;
  pendingProjects: number;
  completedProjects?: number;
  className?: string;
}

export function ProjectStats({
  totalProjects,
  activeProjects,
  pendingProjects,
  completedProjects = 0,
  className,
}: ProjectStatsProps) {
  const stats: ProjectStat[] = [
    {
      label: "Tổng dự án",
      value: totalProjects,
      helper: "đang hiển thị trên hệ thống",
      icon: Sparkles,
    },
    {
      label: "Đang hoạt động",
      value: activeProjects,
      helper: "đã được phê duyệt",
      icon: CheckCircle2,
      trend:
        totalProjects > 0
          ? {
              value: Math.round((activeProjects / totalProjects) * 100),
              label: "% tổng số",
            }
          : undefined,
    },
    {
      label: "Chờ duyệt",
      value: pendingProjects,
      helper: "cần xem xét",
      icon: ShieldAlertIcon,
      trend:
        totalProjects > 0
          ? {
              value: Math.round((pendingProjects / totalProjects) * 100),
              label: "% tổng số",
            }
          : undefined,
    },
    ...(completedProjects > 0
      ? [
          {
            label: "Hoàn thành",
            value: completedProjects,
            helper: "đã kết thúc",
            icon: UsersIcon,
            trend:
              totalProjects > 0
                ? {
                    value: Math.round(
                      (completedProjects / totalProjects) * 100
                    ),
                    label: "% tổng số",
                  }
                : undefined,
          } as ProjectStat,
        ]
      : []),
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  {stat.helper && (
                    <p className="text-xs text-muted-foreground">
                      {stat.helper}
                    </p>
                  )}
                  {stat.trend && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-xs font-semibold text-primary">
                        {stat.trend.value}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {stat.trend.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
