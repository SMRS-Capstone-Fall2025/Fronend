import type { ProjectStatusApi } from "@/services/types/project";
import type { LucideIcon } from "lucide-react";
import {
  Code,
  TrendingUp,
  BarChart3,
  Languages,
  JapaneseYen,
  Cpu,
  Palette,
} from "lucide-react";

export type SpecializationValue = string;

export interface SpecializationOption {
  readonly value: SpecializationValue;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly gradient: string;
  readonly accent: string;
}

export const specializationOptions: readonly SpecializationOption[] = [
  {
    value: "information-technology",
    label: "Công nghệ thông tin",
    description:
      "Phát triển phần mềm, khoa học dữ liệu và giải pháp trí tuệ nhân tạo.",
    icon: Code,
    gradient: "from-sky-500/80 via-blue-500/70 to-indigo-500/80",
    accent: "text-sky-600 dark:text-sky-200",
  },
  {
    value: "business-administration",
    label: "Quản trị kinh doanh",
    description:
      "Chiến lược, vận hành doanh nghiệp và quản trị dự án hiện đại.",
    icon: TrendingUp,
    gradient: "from-orange-400/80 via-amber-500/70 to-rose-500/80",
    accent: "text-orange-600 dark:text-orange-200",
  },
  {
    value: "economics",
    label: "Kinh tế",
    description: "Phân tích tài chính, thị trường và dự báo xu hướng kinh tế.",
    icon: BarChart3,
    gradient: "from-emerald-400/80 via-emerald-500/70 to-teal-500/80",
    accent: "text-emerald-600 dark:text-emerald-200",
  },
  {
    value: "english-language",
    label: "Ngôn ngữ Anh",
    description:
      "Biên phiên dịch, giao tiếp đa văn hóa và truyền thông toàn cầu.",
    icon: Languages,
    gradient: "from-purple-400/80 via-indigo-500/70 to-blue-500/80",
    accent: "text-indigo-600 dark:text-indigo-200",
  },
  {
    value: "japanese-language",
    label: "Ngôn ngữ Nhật",
    description: "Ngôn ngữ, văn hóa và kinh doanh Nhật Bản trong thời đại số.",
    icon: JapaneseYen,
    gradient: "from-pink-400/80 via-rose-500/70 to-red-500/80",
    accent: "text-rose-600 dark:text-rose-200",
  },
  {
    value: "automation",
    label: "Tự động hóa",
    description:
      "Robot, hệ thống điều khiển và sản xuất thông minh thế hệ mới.",
    icon: Cpu,
    gradient: "from-cyan-400/80 via-sky-500/70 to-blue-500/80",
    accent: "text-cyan-600 dark:text-cyan-200",
  },
  {
    value: "graphic-design",
    label: "Thiết kế đồ họa",
    description:
      "Thương hiệu, trải nghiệm người dùng và sáng tạo trực quan đa nền tảng.",
    icon: Palette,
    gradient: "from-fuchsia-400/80 via-violet-500/70 to-purple-500/80",
    accent: "text-fuchsia-600 dark:text-fuchsia-200",
  },
] as const;

export const getSpecializationOption = (
  value?: string | null,
  extras?: Map<string, SpecializationOption> | null
): SpecializationOption | null => {
  if (!value) return null;
  if (extras?.has(value)) {
    return extras.get(value) ?? null;
  }
  return specializationOptions.find((option) => option.value === value) ?? null;
};

export const projectStatusStyles: Record<
  string,
  { label: string; badge: string; dot: string; card: string }
> = {
  active: {
    label: "Đang hoạt động",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    card: "border-emerald-200/70 bg-emerald-50/40 hover:border-emerald-300/80",
  },
  pending: {
    label: "Chờ duyệt",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    card: "border-amber-200/70 bg-amber-50/40 hover:border-amber-300/80",
  },
  archived: {
    label: "Lưu trữ",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
    card: "border-slate-200/70 bg-slate-50/40 hover:border-slate-300/80",
  },
};

const statusColorTokens: Record<
  string,
  {
    readonly gradient: string;
    readonly title: string;
    readonly subtitle: string;
  }
> = {
  active: {
    gradient: "from-emerald-500/80 via-emerald-600/80 to-sky-500/70",
    title: "text-emerald-50",
    subtitle: "text-emerald-100/80",
  },
  pending: {
    gradient: "from-amber-400/80 via-orange-500/75 to-rose-500/70",
    title: "text-amber-50",
    subtitle: "text-amber-100/80",
  },
  archived: {
    gradient: "from-slate-500/80 via-slate-600/70 to-gray-700/70",
    title: "text-slate-100",
    subtitle: "text-slate-200/80",
  },
};

const defaultSpecializationColorToken = {
  gradient: "from-slate-400/80 via-slate-500/70 to-slate-700/70",
  title: "text-white",
  subtitle: "text-white/80",
};

export const getProjectCardColorTokens = (
  specialization: SpecializationOption | null,
  status: string
) => {
  if (specialization) {
    return {
      gradient: specialization.gradient,
      title: "text-white",
      subtitle: "text-white/80",
    } as const;
  }
  return statusColorTokens[status] ?? defaultSpecializationColorToken;
};

export const getStatusStyle = (
  status: string
): { label: string; badge: string; dot: string; card: string } => {
  if (projectStatusStyles[status]) return projectStatusStyles[status];
  const normalized = status.replace(/[-_]+/g, " ");
  const label = normalized
    .split(" ")
    .filter(Boolean)
    .map((segment) =>
      segment.length > 0
        ? segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
        : segment
    )
    .join(" ")
    .trim();
  return {
    label: label || status,
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
    card: "border-slate-200/70 bg-slate-50/40 hover:border-slate-300/80",
  };
};

export const mapApiStatusToSummaryStatus = (
  status?: ProjectStatusApi | null
): string => {
  switch (status) {
    case "Approved":
    case "InProgress":
    case "Completed":
      return "active";
    case "Rejected":
    case "Cancelled":
      return "archived";
    default:
      return "pending";
  }
};

export const projectStatusFilterOptions: Array<{
  readonly value: ProjectStatusApi;
  readonly label: string;
}> = [
  { value: "Pending", label: "Chờ duyệt" },
  { value: "InReview", label: "Đang chấm điểm" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "InProgress", label: "Đang thực hiện" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Rejected", label: "Từ chối" },
  { value: "Cancelled", label: "Đã hủy" },
];

const avatarPalette = [
  "#6366f1",
  "#f97316",
  "#10b981",
  "#0ea5e9",
  "#a855f7",
  "#ef4444",
];

export const makeAvatarColor = (value?: string | null): string => {
  if (!value) return avatarPalette[0];
  let hash = 0;
  for (const char of value) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarPalette.length;
  return avatarPalette[index];
};

export function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}
