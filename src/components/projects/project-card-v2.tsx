import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLineIcon,
  CalendarIcon,
  PaperclipIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react";

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  status: string;
  members: number;
  tasks: number;
  dueDateLabel?: string;
  attachmentCount: number;
  specialization?: {
    value: string;
    label: string;
    icon: LucideIcon;
    accent: string;
  } | null;
}

export interface StatusStyle {
  label: string;
  badge: string;
  dot: string;
  card: string;
}

interface ProjectCardV2Props {
  summary: ProjectSummary;
  statusStyle: StatusStyle;
  gradientClass: string;
  statusTitleClass: string;
  statusSubtitleClass: string;
  onClick: () => void;
}

export function ProjectCardV2({
  summary,
  statusStyle,
  gradientClass,
  statusTitleClass,
  statusSubtitleClass,
  onClick,
}: ProjectCardV2Props) {
  const specialization = summary.specialization ?? null;
  const SpecializationIcon = specialization?.icon ?? null;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Xem chi tiết dự án ${summary.name}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-border/50 bg-white/95 p-1 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none"
    >
      <div className="relative overflow-hidden rounded-[26px] border border-white/40 bg-white flex flex-col h-full">
        <div className="relative h-40 overflow-hidden rounded-t-[26px]">
          <div
            className={cn("absolute inset-0 bg-gradient-to-br", gradientClass)}
          />

          {SpecializationIcon && (
            <div className="absolute -right-4 bottom-0 opacity-[0.15] pointer-events-none sm:-right-6 sm:opacity-[0.18]">
              <SpecializationIcon className="h-32 w-32 text-white/90 sm:h-40 sm:w-40" />
            </div>
          )}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/30 blur-[60px]" />
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/20 blur-[50px]" />
          </div>
          <div className="relative flex h-full flex-col justify-between gap-4 p-4 text-white sm:p-5">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                {specialization && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-tight sm:gap-2 sm:px-3 sm:text-[11px]">
                    {SpecializationIcon && (
                      <SpecializationIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    )}
                    <span className="truncate">{specialization.label}</span>
                  </div>
                )}
                <div>
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-[0.15em] sm:text-xs sm:tracking-[0.2em]",
                      statusSubtitleClass
                    )}
                  >
                    {summary.status === "pending"
                      ? "Chờ hội đồng"
                      : "Đang triển khai"}
                  </p>
                  <h3
                    className={cn(
                      "mt-1 text-base font-semibold leading-tight sm:text-lg",
                      statusTitleClass
                    )}
                  >
                    {summary.name}
                  </h3>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1.5 rounded-full border-0 bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur text-nowrap sm:px-3 sm:text-[11px] flex-shrink-0",
                  statusStyle.badge
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
                    statusStyle.dot
                  )}
                />
                <span className="hidden sm:inline">{statusStyle.label}</span>
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/80 sm:gap-3 sm:text-xs">
              <div className="inline-flex items-center gap-1 sm:gap-1.5">
                <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="truncate">
                  {summary.dueDateLabel ?? "Chưa có hạn"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1 sm:gap-1.5">
                <PaperclipIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="truncate">
                  {summary.attachmentCount > 0
                    ? `${summary.attachmentCount} tài liệu`
                    : "Chưa có tài liệu"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {summary.description || "Dự án chưa có mô tả chi tiết."}
          </p>

          <div className="flex items-center w-full">
            <div className="flex items-center gap-2.5 w-full sm:gap-3">
              <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-2 shadow-sm flex-shrink-0 sm:p-2.5">
                <UsersIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Thành viên
                </p>
                <p className="font-bold text-base text-foreground sm:text-lg">
                  {summary.members} người
                </p>
              </div>
            </div>
          </div>

          {summary.status === "pending" && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-[10px] font-medium text-amber-800 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-xs">
              <ShieldAlertIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
              <div className="min-w-0 flex-1">
                <span className="block font-semibold">Chờ hội đồng duyệt</span>
                <span className="text-[9px] text-amber-700/80 sm:text-[11px]">
                  Theo dõi thông báo trong mục lời mời để biết kết quả.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-3 text-[10px] text-muted-foreground sm:px-5 sm:py-4 sm:text-xs mt-auto">
          <span className="truncate">Nhấn để xem chi tiết</span>
          <ArrowDownToLineIcon className="h-3.5 w-3.5 text-muted-foreground/70 transition flex-shrink-0 group-hover:translate-y-0.5 sm:h-4 sm:w-4" />
        </div>
      </div>
    </article>
  );
}
