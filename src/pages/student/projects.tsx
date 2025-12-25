import { PickProjectDialog } from "@/components/projects/pick-project-dialog";
import { ProjectCardV2 } from "@/components/projects/project-card-v2";
import { ProjectFiltersSidebar } from "@/components/projects/project-filters-sidebar";
import { ResubmitProjectDialog } from "@/components/projects/resubmit-project-dialog";
import { StudentProjectDetailDialog } from "@/components/projects/student-project-detail-dialog";
import { statusToLabel } from "@/components/projects/ProjectsTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { useAuthAccountStore } from "@/lib/auth-store";
import { formatDateDisplay } from "@/lib/date-utils";
import type { SubmissionAsset, UserSummary } from "@/lib/project-types";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  inviteSchema,
  projectSchema,
  type InviteFormValues,
  type ProjectFormValues,
} from "@/lib/validations/project";
import { useMajorsQuery } from "@/services/major";
import {
  useCreateProjectMutation,
  usePickProjectMutation,
  useProjectDetailQuery,
  useProjectsInfiniteQuery,
  useResubmitProjectMutation,
} from "@/services/project";
import {
  useInviteProjectMembersMutation,
  useDeleteProjectMemberMutation,
} from "@/services/project-member";
import type { MajorDto } from "@/services/types";
import type {
  ProjectListItemDto,
  ProjectListQuery,
  ProjectListResponse,
  ProjectStatusApi,
} from "@/services/types/project";
import {
  useUploadFileMutation,
  useUploadImageMutation,
} from "@/services/upload";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Brain,
  Briefcase,
  ClipboardListIcon,
  Code,
  Compass,
  Cpu,
  FileIcon,
  JapaneseYen,
  Languages,
  LineChart,
  Loader2,
  Megaphone,
  Palette,
  Plus,
  RotateCwIcon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import StudentLayout from "./layout";

type SpecializationValue = string;

type PreviewItem = {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  file: File;
  fileType: string;
};

type InviteTarget = "member" | "mentor";

type ProjectSummary = {
  id: string;
  name: string;
  description: string;
  status: string;
  members: number;
  tasks: number;
  dueDateLabel?: string;
  attachmentCount: number;
  specialization?: SpecializationOption | null;
};

type ProjectMemberInfo = UserSummary & {
  inviteStatus?: string | null;
};

type ProjectDetailMeta = {
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  leader?: ProjectMemberInfo;
  collaborators: ProjectMemberInfo[];
  mentors: ProjectMemberInfo[];
  attachments: SubmissionAsset[];
  rejectionReason?: string | null;
  rejectionFeedback?: string | null;
  revisionDeadline?: string | null;
};

type SpecializationOption = {
  readonly value: SpecializationValue;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly gradient: string;
  readonly accent: string;
};

type ProjectsTabValue = "discover" | "mine";

const projectTabs: Record<
  ProjectsTabValue,
  {
    readonly label: string;
    readonly description: string;
    readonly accent: string;
    readonly icon: LucideIcon;
  }
> = {
  discover: {
    label: "Tìm dự án",
    description:
      "Khám phá đề tài nổi bật và xin tham gia những nhóm đang tuyển thành viên.",
    accent: "text-sky-600",
    icon: Compass,
  },
  mine: {
    label: "Dự án của tôi",
    description: "Theo dõi, quản lý và cập nhật các dự án bạn đang tham gia.",
    accent: "text-violet-600",
    icon: ClipboardListIcon,
  },
};

const projectTabOrder: readonly ProjectsTabValue[] = ["discover", "mine"];

const specializationOptions: readonly SpecializationOption[] = [
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

const getSpecializationOption = (
  value?: string | null,
  extras?: Map<string, SpecializationOption> | null
): SpecializationOption | null => {
  if (!value) return null;
  if (extras?.has(value)) {
    return extras.get(value) ?? null;
  }
  return specializationOptions.find((option) => option.value === value) ?? null;
};

type NormalizedProject = {
  id: string;
  apiId: number | null;
  ownerAccountId: number | null;
  summary: ProjectSummary;
  detail: ProjectDetailMeta;
  name: string;
  description: string;
  status: string;
  dueDate?: string;
  specialization: SpecializationOption | null;
  specializationValue: SpecializationValue | null;
};

const projectStatusStyles: Record<
  string,
  { label: string; badge: string; dot: string; card: string }
> = {
  pending: {
    label: statusToLabel("pending"),
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    card: "border-amber-200/70 bg-amber-50/40 hover:border-amber-300/80",
  },
  approved: {
    label: statusToLabel("approved"),
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    card: "border-emerald-200/70 bg-emerald-50/40 hover:border-emerald-300/80",
  },
  inreview: {
    label: statusToLabel("inreview"),
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    card: "border-blue-200/70 bg-blue-50/40 hover:border-blue-300/80",
  },
  inprogress: {
    label: statusToLabel("inprogress"),
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    card: "border-blue-200/70 bg-blue-50/40 hover:border-blue-300/80",
  },
  completed: {
    label: statusToLabel("completed"),
    badge: "border-green-200 bg-green-50 text-green-700",
    dot: "bg-green-500",
    card: "border-green-200/70 bg-green-50/40 hover:border-green-300/80",
  },
  rejected: {
    label: statusToLabel("rejected"),
    badge: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
    card: "border-red-200/70 bg-red-50/40 hover:border-red-300/80",
  },
  cancelled: {
    label: statusToLabel("cancelled"),
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
    card: "border-slate-200/70 bg-slate-50/40 hover:border-slate-300/80",
  },
  archived: {
    label: statusToLabel("archived"),
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
    card: "border-slate-200/70 bg-slate-50/40 hover:border-slate-300/80",
  },
  revisionrequired: {
    label: statusToLabel("revisionrequired"),
    badge: "border-yellow-200 bg-yellow-50 text-yellow-700",
    dot: "bg-yellow-500",
    card: "border-yellow-200/70 bg-yellow-50/40 hover:border-yellow-300/80",
  },
  scored: {
    label: statusToLabel("scored"),
    badge: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
    card: "border-purple-200/70 bg-purple-50/40 hover:border-purple-300/80",
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
  pending: {
    gradient: "from-amber-400/80 via-orange-500/75 to-rose-500/70",
    title: "text-amber-50",
    subtitle: "text-amber-100/80",
  },
  approved: {
    gradient: "from-emerald-500/80 via-emerald-600/80 to-sky-500/70",
    title: "text-emerald-50",
    subtitle: "text-emerald-100/80",
  },
  inreview: {
    gradient: "from-blue-500/80 via-blue-600/80 to-indigo-500/70",
    title: "text-blue-50",
    subtitle: "text-blue-100/80",
  },
  inprogress: {
    gradient: "from-blue-500/80 via-blue-600/80 to-indigo-500/70",
    title: "text-blue-50",
    subtitle: "text-blue-100/80",
  },
  completed: {
    gradient: "from-green-500/80 via-green-600/80 to-emerald-500/70",
    title: "text-green-50",
    subtitle: "text-green-100/80",
  },
  rejected: {
    gradient: "from-red-500/80 via-red-600/80 to-rose-500/70",
    title: "text-red-50",
    subtitle: "text-red-100/80",
  },
  cancelled: {
    gradient: "from-slate-500/80 via-slate-600/70 to-gray-700/70",
    title: "text-slate-100",
    subtitle: "text-slate-200/80",
  },
  archived: {
    gradient: "from-slate-500/80 via-slate-600/70 to-gray-700/70",
    title: "text-slate-100",
    subtitle: "text-slate-200/80",
  },
  revisionrequired: {
    gradient: "from-yellow-500/80 via-yellow-600/80 to-amber-500/70",
    title: "text-yellow-50",
    subtitle: "text-yellow-100/80",
  },
  scored: {
    gradient: "from-purple-500/80 via-purple-600/80 to-violet-500/70",
    title: "text-purple-50",
    subtitle: "text-purple-100/80",
  },
};

const defaultSpecializationColorToken = {
  gradient: "from-slate-400/80 via-slate-500/70 to-slate-700/70",
  title: "text-white",
  subtitle: "text-white/80",
};

const getProjectCardColorTokens = (
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

const getStatusStyle = (
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

const mapApiStatusToSummaryStatus = (
  status?: ProjectStatusApi | null
): string => {
  if (!status) return "pending";
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "pending":
      return "pending";
    case "approved":
      return "approved";
    case "inreview":
      return "inreview";
    case "inprogress":
      return "inprogress";
    case "completed":
      return "completed";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    case "archived":
      return "archived";
    case "revisionrequired":
      return "revisionrequired";
    case "scored":
      return "scored";
    default:
      return "pending";
  }
};

const projectStatusFilterOptions: Array<{
  readonly value: ProjectStatusApi;
  readonly label: string;
}> = [
  { value: "Pending", label: "Chờ duyệt" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "InProgress", label: "Đang thực hiện" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Rejected", label: "Từ chối" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "Archived", label: "Lưu trữ" },
  { value: "RevisionRequired", label: "Yêu cầu sửa đổi" },
  { value: "Scored", label: "Đã chấm điểm" },
];

const avatarPalette = [
  "#6366f1",
  "#f97316",
  "#10b981",
  "#0ea5e9",
  "#a855f7",
  "#ef4444",
  "#f59e0b",
];

const makeAvatarColor = (value?: string | null): string => {
  if (!value) return avatarPalette[0];
  let hash = 0;
  for (const char of value) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarPalette.length;
  return avatarPalette[index];
};

export function ProjectsPageContent({
  variant = "student",
}: {
  readonly variant?: "student" | "mentor";
}) {
  const isMentorView = variant === "mentor";
  const { toast } = useToast();
  const authAccount = useAuthAccountStore((state) => state.account);
  const { user } = useAuth();
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ProjectStatusApi>("");
  const SPECIALIZATION_FILTER_UNKNOWN_VALUE = "__unknown__";
  const [specializationFilter, setSpecializationFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ProjectsTabValue>("discover");
  const debouncedNameFilter = useDebounce(nameFilter.trim(), 300);
  const myAccountId =
    typeof authAccount?.id === "number" && Number.isFinite(authAccount.id)
      ? authAccount.id
      : null;
  const canViewMyProjects = myAccountId != null;
  const isMyProjectsView = canViewMyProjects && activeTab === "mine";

  useEffect(() => {
    if (!canViewMyProjects && activeTab === "mine") {
      setActiveTab("discover");
    }
  }, [canViewMyProjects, activeTab]);

  const projectQueryBaseParams = useMemo<
    Omit<ProjectListQuery, "page" | "size">
  >(() => {
    return {
      sortDir: "desc",
      ...(debouncedNameFilter ? { name: debouncedNameFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(isMyProjectsView && myAccountId != null ? { isMine: true } : {}),
      ...(specializationFilter &&
      specializationFilter !== SPECIALIZATION_FILTER_UNKNOWN_VALUE
        ? { type: specializationFilter }
        : {}),
    };
  }, [
    debouncedNameFilter,
    statusFilter,
    isMyProjectsView,
    myAccountId,
    specializationFilter,
  ]);

  const {
    data: projectsInfiniteData,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchProjects,
  } = useProjectsInfiniteQuery(projectQueryBaseParams);

  const { mutateAsync: inviteMembers, isPending: isInvitingMembers } =
    useInviteProjectMembersMutation();

  const deleteMemberMutation = useDeleteProjectMemberMutation({
    onSuccess: () => {
      toast({
        title: "Đã xóa thành viên",
        description: "Thành viên đã được xóa khỏi dự án.",
      });
      // invalidateQueries trong hook đã tự động trigger refetch rồi
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Không thể xóa thành viên",
        description: getErrorMessage(error),
      });
    },
  });

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedProjectApiId) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không tìm thấy thông tin dự án.",
      });
      return;
    }
    await deleteMemberMutation.mutateAsync({
      projectId: selectedProjectApiId,
      memberId,
    });
  };

  const pickProjectMutation = usePickProjectMutation({
    onSuccess: async () => {
      toast({
        title: "Đã chọn dự án thành công",
        description: "Dự án đã được tạo lại và đang chờ duyệt.",
      });
      await refetchProjects();
      setPickProjectDialogOpen(false);
      setDetailId(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Chọn dự án thất bại",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
      });
    },
  });

  const resubmitProjectMutation = useResubmitProjectMutation({
    onSuccess: async () => {
      toast({
        title: "Đã nộp lại dự án thành công",
        description: "Dự án đã được nộp lại và đang chờ duyệt.",
      });
      await refetchProjects();
      setResubmitProjectDialogOpen(false);
      setResubmitProjectId(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Nộp lại dự án thất bại",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
      });
    },
  });

  const { data: majors } = useMajorsQuery();

  const projectsContent = useMemo(
    () =>
      projectsInfiniteData?.pages.flatMap(
        (page) => (page as ProjectListResponse)?.content ?? []
      ) ?? [],
    [projectsInfiniteData?.pages]
  );

  const projectsPage = useMemo(
    () => projectsInfiniteData?.pages?.[0] as ProjectListResponse | undefined,
    [projectsInfiniteData?.pages]
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    if (!trigger || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
      }),
    []
  );

  const majorVisuals = useMemo<
    Record<string, { icon: LucideIcon; gradient: string; accent: string }>
  >(
    () => ({
      IA: {
        icon: ShieldCheck,
        gradient: "from-emerald-500/80 via-teal-500/70 to-sky-500/70",
        accent: "text-emerald-600 dark:text-emerald-200",
      },
      IT: {
        icon: Cpu,
        gradient: "from-sky-500/80 via-blue-500/70 to-indigo-500/70",
        accent: "text-sky-600 dark:text-sky-200",
      },
      DS: {
        icon: LineChart,
        gradient: "from-amber-400/80 via-orange-500/70 to-rose-500/70",
        accent: "text-amber-600 dark:text-amber-200",
      },
      SE: {
        icon: Code,
        gradient: "from-indigo-500/80 via-violet-500/70 to-purple-500/70",
        accent: "text-indigo-600 dark:text-indigo-200",
      },
      MKT: {
        icon: Megaphone,
        gradient: "from-pink-400/80 via-rose-500/70 to-orange-500/70",
        accent: "text-rose-600 dark:text-rose-200",
      },
      EN: {
        icon: Languages,
        gradient: "from-blue-400/80 via-sky-500/70 to-cyan-500/70",
        accent: "text-blue-600 dark:text-blue-200",
      },
      JP: {
        icon: JapaneseYen,
        gradient: "from-rose-400/80 via-red-500/70 to-orange-500/70",
        accent: "text-rose-600 dark:text-rose-200",
      },
      BA: {
        icon: Briefcase,
        gradient: "from-amber-400/80 via-yellow-500/70 to-lime-500/70",
        accent: "text-amber-600 dark:text-amber-200",
      },
      GD: {
        icon: Palette,
        gradient: "from-fuchsia-400/80 via-violet-500/70 to-purple-500/70",
        accent: "text-fuchsia-600 dark:text-fuchsia-200",
      },
      AI: {
        icon: Brain,
        gradient: "from-cyan-400/80 via-emerald-500/70 to-blue-500/70",
        accent: "text-cyan-600 dark:text-cyan-200",
      },
    }),
    []
  );

  const fallbackVisual = useMemo(
    () => ({
      icon: Compass,
      gradient: "from-slate-500/50 via-slate-600/40 to-slate-900/40",
      accent: "text-slate-600 dark:text-slate-200",
    }),
    []
  );

  const majorSpecializationOptions = useMemo<SpecializationOption[]>(() => {
    if (!majors?.length) return [];

    const map = new Map<string, SpecializationOption>();
    majors.forEach((major) => {
      if (!major || major.isActive === false) return;
      const code = major.code?.trim();
      const normalizedCode = code ? code.toUpperCase() : undefined;
      const name = major.name?.trim();
      const slug = name
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
        : undefined;
      const rawValue =
        normalizedCode || slug || (major.id != null ? String(major.id) : "");
      if (!rawValue) {
        return;
      }
      const value = rawValue as SpecializationValue;
      if (map.has(value)) {
        return;
      }
      const visuals =
        (normalizedCode && majorVisuals[normalizedCode]) || fallbackVisual;
      map.set(value, {
        value,
        label: name || normalizedCode || `Chuyên ngành ${major.id ?? ""}`,
        description:
          major.description?.trim() ||
          "Chuyên ngành được cung cấp bởi phòng đào tạo.",
        icon: visuals.icon,
        gradient: visuals.gradient,
        accent: visuals.accent,
      });
    });
    return Array.from(map.values());
  }, [majors, majorVisuals, fallbackVisual]);

  const specializationLookup = useMemo(() => {
    const map = new Map<string, SpecializationOption>();
    specializationOptions.forEach((option) => {
      map.set(option.value, option);
    });
    majorSpecializationOptions.forEach((option) => {
      map.set(option.value, option);
    });
    return map;
  }, [majorSpecializationOptions]);

  const specializationValueToMajorMap = useMemo(() => {
    const map = new Map<string, { id: number; name: string }>();
    if (!majors?.length) return map;

    majors.forEach((major) => {
      if (!major || major.isActive === false || major.id == null) return;
      const code = major.code?.trim();
      const normalizedCode = code ? code.toUpperCase() : undefined;
      const name = major.name?.trim();
      const slug = name
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
        : undefined;
      const rawValue =
        normalizedCode || slug || (major.id != null ? String(major.id) : "");
      if (!rawValue || !name) return;

      const value = rawValue as SpecializationValue;
      map.set(value, { id: major.id, name });
    });
    return map;
  }, [majors]);

  // Map from majorId to major object (for getting code, icon, and colors)
  const majorIdToMajorMap = useMemo(() => {
    const map = new Map<number, MajorDto>();
    if (!majors?.length) return map;
    majors.forEach((major) => {
      if (major?.id != null) {
        map.set(major.id, major);
      }
    });
    return map;
  }, [majors]);

  const specializationSelectOptions = useMemo(
    () =>
      majorSpecializationOptions.length > 0
        ? majorSpecializationOptions
        : specializationOptions,
    [majorSpecializationOptions]
  );

  const specializationInitialValue = "" as SpecializationValue;

  useEffect(() => {
    if (!specializationFilter) return;
    if (specializationFilter === SPECIALIZATION_FILTER_UNKNOWN_VALUE) {
      return;
    }
    const exists = specializationSelectOptions.some(
      (option) => option.value === specializationFilter
    );
    if (!exists) {
      setSpecializationFilter("");
    }
  }, [
    specializationFilter,
    specializationSelectOptions,
    SPECIALIZATION_FILTER_UNKNOWN_VALUE,
  ]);

  const normalizedProjects = useMemo<NormalizedProject[]>(
    () =>
      projectsContent.map((project: ProjectListItemDto, index) => {
        const fallbackId = `project-${index}`;
        const apiId = project.id ?? null;
        const id = apiId != null ? String(apiId) : fallbackId;
        const status = mapApiStatusToSummaryStatus(project.status);
        const ownerAccountId = project.ownerId ?? null;

        // Try to get specialization from majorId first, then fallback to type
        let specialization: SpecializationOption | null = null;
        if (project.majorId != null) {
          const major = majorIdToMajorMap.get(project.majorId);
          if (major) {
            const code = major.code?.trim();
            const normalizedCode = code ? code.toUpperCase() : undefined;
            const name = major.name?.trim();
            if (name) {
              const slug = name
                ? name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")
                : undefined;
              const value =
                normalizedCode ||
                slug ||
                (major.id != null ? String(major.id) : "");
              if (value) {
                const visuals =
                  (normalizedCode && majorVisuals[normalizedCode]) ||
                  fallbackVisual;
                specialization = {
                  value:
                    name || normalizedCode || `Chuyên ngành ${major.id ?? ""}`,
                  label:
                    name || normalizedCode || `Chuyên ngành ${major.id ?? ""}`,
                  description: "Chuyên ngành được cung cấp bởi phòng đào tạo.",
                  icon: visuals.icon,
                  gradient: visuals.gradient,
                  accent: visuals.accent,
                };
              }
            }
          }
        }

        // Fallback to type if specialization not found from majorId
        if (!specialization) {
          specialization = getSpecializationOption(
            project.type,
            specializationLookup
          );
        }

        const leader: UserSummary | undefined = project.ownerName
          ? {
              id:
                project.ownerId != null
                  ? String(project.ownerId)
                  : `owner-${id}`,
              name: project.ownerName,
              email: "Chưa cập nhật",
              role: "leader",
              avatarColor: makeAvatarColor(project.ownerName),
            }
          : undefined;

        const dueDateLabel = formatDateDisplay(project.dueDate, dateFormatter);

        const hasMentor = project.mentor != null;
        const studentsCount = Array.isArray(project.students)
          ? project.students.length
          : 0;
        const memberCount = 1 + (hasMentor ? 1 : 0) + studentsCount;

        const summary: ProjectSummary = {
          id,
          name: project.name ?? "Chưa có tên",
          description: project.description ?? "",
          status,
          members: memberCount,
          tasks: 0,
          dueDateLabel,
          attachmentCount: 0,
          specialization,
        };

        const detail: ProjectDetailMeta = {
          createdAt: undefined,
          updatedAt: undefined,
          dueDate: dueDateLabel,
          leader,
          collaborators: [],
          mentors: [],
          attachments: [],
          rejectionReason: project.rejectionReason ?? null,
          rejectionFeedback: project.rejectionFeedback ?? null,
          revisionDeadline: project.revisionDeadline
            ? formatDateDisplay(project.revisionDeadline, dateFormatter)
            : null,
        };

        return {
          id,
          apiId,
          summary,
          detail,
          name: summary.name,
          description: summary.description,
          status,
          dueDate: project.dueDate ?? undefined,
          ownerAccountId,
          specialization,
          specializationValue: specialization?.value ?? null,
        };
      }),
    [
      projectsContent,
      dateFormatter,
      specializationLookup,
      majorIdToMajorMap,
      majorVisuals,
      fallbackVisual,
    ]
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<PreviewItem[]>([]);
  const [imagePreviews, setImagePreviews] = useState<PreviewItem[]>([]);
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);
  const [pickProjectDialogOpen, setPickProjectDialogOpen] = useState(false);
  const [resubmitProjectDialogOpen, setResubmitProjectDialogOpen] =
    useState(false);
  const [resubmitProjectId, setResubmitProjectId] = useState<number | null>(
    null
  );
  const [attachmentCountByProjectId, setAttachmentCountByProjectId] = useState<
    Record<string, number>
  >({});

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      dueDate: "",
      specialization: specializationInitialValue,
      majorId: undefined,
    },
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!specializationSelectOptions.length) {
      return;
    }
    const currentValue = form.getValues("specialization");
    const exists = specializationSelectOptions.some(
      (option) => option.value === currentValue
    );
    if (currentValue && !exists) {
      form.setValue("specialization", specializationInitialValue, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [form, specializationSelectOptions, specializationInitialValue]);

  const { mutateAsync: createProject, isPending: isCreating } =
    useCreateProjectMutation();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadImageMutation();
  const { mutateAsync: uploadFile, isPending: isUploadingFile } =
    useUploadFileMutation();
  const isUploading = isUploadingImage || isUploadingFile;

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "" },
  });

  const {
    formState: { errors: inviteErrors, isSubmitting: inviteSubmitting },
  } = inviteForm;

  const resetInviteForm = inviteForm.reset;

  const isInviteProcessing = inviteSubmitting || isInvitingMembers;

  useEffect(() => {
    return () => {
      [...filePreviews, ...imagePreviews].forEach((item) =>
        URL.revokeObjectURL(item.previewUrl)
      );
    };
  }, [filePreviews, imagePreviews]);

  const projectSummaries = useMemo<ProjectSummary[]>(
    () =>
      normalizedProjects.map((project) => {
        const override = attachmentCountByProjectId[project.id];
        if (override == null) {
          return project.summary;
        }
        if (project.summary.attachmentCount === override) {
          return project.summary;
        }
        return { ...project.summary, attachmentCount: override };
      }),
    [normalizedProjects, attachmentCountByProjectId]
  );

  const filteredProjectSummaries = useMemo<ProjectSummary[]>(() => {
    if (!specializationFilter) {
      return projectSummaries;
    }
    if (specializationFilter === SPECIALIZATION_FILTER_UNKNOWN_VALUE) {
      return projectSummaries.filter(
        (project) => !project.specialization?.value
      );
    }
    const normalizedFilter = specializationFilter.toLowerCase();
    return projectSummaries.filter((project) => {
      const value = project.specialization?.value;
      if (!value) return false;
      return value.toLowerCase() === normalizedFilter;
    });
  }, [
    projectSummaries,
    specializationFilter,
    SPECIALIZATION_FILTER_UNKNOWN_VALUE,
  ]);

  useEffect(() => {
    if (normalizedProjects.length === 0) {
      setAttachmentCountByProjectId((prev) => {
        if (Object.keys(prev).length === 0) {
          return prev;
        }
        return {};
      });
      return;
    }

    const validIds = new Set(normalizedProjects.map((project) => project.id));

    setAttachmentCountByProjectId((prev) => {
      let hasChanges = false;
      const next: Record<string, number> = {};

      for (const [projectId, count] of Object.entries(prev)) {
        if (validIds.has(projectId)) {
          next[projectId] = count;
        } else {
          hasChanges = true;
        }
      }

      return hasChanges ? next : prev;
    });
  }, [normalizedProjects]);

  const selectedProject = useMemo(
    () => normalizedProjects.find((project) => project.id === detailId) ?? null,
    [normalizedProjects, detailId]
  );

  const resubmitProject = useMemo(
    () =>
      resubmitProjectId != null
        ? normalizedProjects.find(
            (project) => project.apiId === resubmitProjectId
          ) ?? null
        : null,
    [normalizedProjects, resubmitProjectId]
  );

  const selectedProjectApiId = selectedProject?.apiId ?? null;
  const selectedProjectOwnerId =
    selectedProject?.ownerAccountId != null
      ? String(selectedProject.ownerAccountId)
      : null;
  const selectedProjectSpecialization = selectedProject?.specialization ?? null;
  const DetailSpecializationIcon = selectedProjectSpecialization?.icon ?? null;

  const {
    data: projectDetail,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
    error: projectDetailError,
    refetch: refetchProjectDetail,
  } = useProjectDetailQuery(selectedProjectApiId, {
    enabled: selectedProjectApiId != null,
  });

  const selectedMeta = useMemo<ProjectDetailMeta | null>(() => {
    if (!selectedProject) return null;

    // Get rejection info from list first (already in selectedProject.detail)
    if (!projectDetail) {
      return selectedProject.detail;
    }

    const formattedCreatedAt = formatDateDisplay(
      projectDetail.createDate,
      dateFormatter
    );
    const formattedDueDate = formatDateDisplay(
      projectDetail.dueDate,
      dateFormatter
    );

    const owner = projectDetail.owner;
    const ownerRole = owner?.role ? String(owner.role).toLowerCase() : "";
    const ownerIsLecturer = ["lecturer", "mentor", "teacher"].includes(
      ownerRole
    );

    const ownerIdSet = new Set<string>();
    const ownerEmailSet = new Set<string>();

    const mentors: ProjectMemberInfo[] = [];
    const addMentor = (mentor: ProjectMemberInfo, prepend = false) => {
      const normalizedEmail = mentor.email.trim().toLowerCase();
      const exists = mentors.some((existing) => {
        const existingEmail = existing.email.trim().toLowerCase();
        return (
          existing.id === mentor.id ||
          (normalizedEmail && normalizedEmail === existingEmail)
        );
      });
      if (exists) return;
      if (prepend) {
        mentors.unshift(mentor);
      } else {
        mentors.push(mentor);
      }
    };

    selectedProject.detail.mentors.forEach((mentor) => addMentor(mentor));

    let leader: ProjectMemberInfo | undefined;

    if (owner) {
      const ownerSummary: ProjectMemberInfo = {
        id:
          owner.id != null
            ? String(owner.id)
            : owner.email ?? owner.name ?? "owner",
        name: owner.name ?? "Chưa cập nhật",
        email: owner.email ?? "Chưa cập nhật",
        role: ownerIsLecturer ? "teacher" : "leader",
        avatarColor: makeAvatarColor(owner.name ?? owner.email ?? null),
      };

      if (owner.id != null) {
        ownerIdSet.add(String(owner.id));
      }
      if (owner.email) {
        ownerEmailSet.add(owner.email.trim().toLowerCase());
      }

      if (ownerIsLecturer) {
        addMentor(ownerSummary, true);
      } else {
        leader = ownerSummary;
      }
    }

    if (!leader && !owner && selectedProject.detail.leader) {
      leader = selectedProject.detail.leader;
    }

    const lecturer = projectDetail.lecturer;
    if (lecturer) {
      const lecturerSummary: ProjectMemberInfo = {
        id:
          lecturer.id != null
            ? String(lecturer.id)
            : lecturer.accountId != null
            ? String(lecturer.accountId)
            : lecturer.email ?? "lecturer",
        name: lecturer.name ?? "Chưa cập nhật",
        email: lecturer.email ?? "Chưa cập nhật",
        role: "teacher",
        avatarColor: makeAvatarColor(lecturer.name ?? lecturer.email ?? null),
        inviteStatus: lecturer.status ?? null,
      };
      addMentor(lecturerSummary);
    }

    const leaderId = leader?.id;

    const collaborators: ProjectMemberInfo[] = (projectDetail.members ?? [])
      .filter((member) => {
        const candidateId =
          member.id != null
            ? String(member.id)
            : member.accountId != null
            ? String(member.accountId)
            : null;
        if (leaderId && candidateId && candidateId === leaderId) {
          return false;
        }
        if (!leaderId && candidateId && ownerIdSet.has(candidateId)) {
          return false;
        }
        const memberEmail = member.email?.trim().toLowerCase();
        if (!leaderId && memberEmail && ownerEmailSet.has(memberEmail)) {
          return false;
        }
        return true;
      })
      .map((member, index) => {
        return {
          id:
            member.id != null
              ? String(member.id)
              : member.accountId != null
              ? String(member.accountId)
              : `member-${index}`,
          name: member.name ?? "Chưa cập nhật",
          email: member.email ?? "Chưa cập nhật",
          role: "member",
          avatarColor: makeAvatarColor(member.name ?? member.email ?? null),
          inviteStatus: member.status ?? null,
        };
      });

    const attachments: SubmissionAsset[] = [];

    (projectDetail.files ?? []).forEach((file, index) => {
      if (!file.filePath) return;
      const name = file.filePath.split("/").pop() ?? file.filePath;
      attachments.push({
        id: `file-${file.id ?? file.filePath ?? index}`,
        name,
        url: file.filePath,
        type: "file",
      });
    });

    (projectDetail.images ?? []).forEach((image, index) => {
      if (!image.url) return;
      const name = image.url.split("/").pop() ?? image.url;
      attachments.push({
        id: `image-${image.id ?? image.url ?? index}`,
        name,
        url: image.url,
        type: "link",
      });
    });

    // Get rejection info from project list first, fallback to detail
    const projectFromList = projectsContent.find(
      (p) => p.id === projectDetail.id
    );
    const rejectionReason =
      projectFromList?.rejectionReason ?? projectDetail.rejectionReason ?? null;
    const rejectionFeedback =
      projectFromList?.rejectionFeedback ??
      projectDetail.rejectionFeedback ??
      null;
    const revisionDeadline =
      projectFromList?.revisionDeadline ?? projectDetail.revisionDeadline
        ? formatDateDisplay(
            projectFromList?.revisionDeadline ??
              projectDetail.revisionDeadline ??
              "",
            dateFormatter
          )
        : null;

    return {
      createdAt: formattedCreatedAt ?? undefined,
      updatedAt: undefined,
      dueDate: formattedDueDate ?? undefined,
      leader,
      collaborators,
      mentors,
      attachments,
      rejectionReason,
      rejectionFeedback,
      revisionDeadline,
    };
  }, [selectedProject, projectDetail, projectsContent, dateFormatter]);

  useEffect(() => {
    if (!selectedProject?.id) return;

    if (!projectDetail) return;

    const totals = projectDetail.statistics;
    const filesFromStats =
      typeof totals?.totalFiles === "number" ? totals.totalFiles : null;
    const imagesFromStats =
      typeof totals?.totalImages === "number" ? totals.totalImages : null;
    const countFromStats =
      filesFromStats != null || imagesFromStats != null
        ? (filesFromStats ?? 0) + (imagesFromStats ?? 0)
        : null;

    const fallbackFiles = Array.isArray(projectDetail.files)
      ? projectDetail.files.filter((file) => Boolean(file?.filePath)).length
      : 0;
    const fallbackImages = Array.isArray(projectDetail.images)
      ? projectDetail.images.filter((image) => Boolean(image?.url)).length
      : 0;

    const computedCount =
      countFromStats != null ? countFromStats : fallbackFiles + fallbackImages;

    setAttachmentCountByProjectId((prev) => {
      if (prev[selectedProject.id] === computedCount) {
        return prev;
      }
      return { ...prev, [selectedProject.id]: computedCount };
    });
  }, [selectedProject?.id, projectDetail]);

  const detailStatus = projectDetail?.status
    ? mapApiStatusToSummaryStatus(projectDetail.status)
    : selectedProject?.summary.status ?? "";

  const isArchived =
    detailStatus === "archived" ||
    selectedProject?.summary.status === "archived";

  const detailStatusStyle = getStatusStyle(detailStatus);

  const currentAccountId =
    authAccount?.id != null ? String(authAccount.id) : null;
  const currentEmail = (authAccount?.email ?? user?.email ?? "")
    .trim()
    .toLowerCase();

  const detailOwnerId =
    projectDetail?.owner?.id != null ? String(projectDetail.owner.id) : null;
  const detailOwnerEmail = projectDetail?.owner?.email
    ? projectDetail.owner.email.trim().toLowerCase()
    : null;

  const matchesOwnerId = Boolean(
    currentAccountId &&
      ((detailOwnerId && detailOwnerId === currentAccountId) ||
        (!detailOwnerId &&
          selectedProjectOwnerId != null &&
          selectedProjectOwnerId === currentAccountId))
  );

  const matchesOwnerEmail = Boolean(
    currentEmail && detailOwnerEmail && detailOwnerEmail === currentEmail
  );

  const canInvite =
    (matchesOwnerId || matchesOwnerEmail) &&
    mapApiStatusToSummaryStatus(projectDetail?.status) !== "rejected" &&
    mapApiStatusToSummaryStatus(projectDetail?.status) !== "scored" &&
    mapApiStatusToSummaryStatus(projectDetail?.status) !== "inreview" &&
    mapApiStatusToSummaryStatus(projectDetail?.status) !== "cancelled";

  const isDetailBusy =
    (isDetailLoading || isDetailFetching) && selectedProjectApiId != null;
  const showDetailError =
    Boolean(projectDetailError) && selectedProjectApiId != null;
  const isDetailEmpty =
    projectDetail === null &&
    selectedProjectApiId != null &&
    !isDetailBusy &&
    !showDetailError;

  const isInitialLoading = isProjectsLoading && projectSummaries.length === 0;
  const totalProjectsCount =
    projectsPage?.totalElements ?? projectsContent.length;
  const heroPendingProjects = projectSummaries.filter(
    (project) => project.status === "pending"
  ).length;
  const heroStats = [
    {
      label: "Dự án hiển thị",
      value: totalProjectsCount,
      helper: "đang mở trên hệ thống",
      icon: Sparkles,
    },
    {
      label: "Đang chờ duyệt",
      value: heroPendingProjects,
      helper: "cần bổ sung thông tin",
      icon: ShieldAlert,
    },
  ] as const;
  const invitationsPath = isMentorView
    ? "/mentor/invitations"
    : "/student/invitations";

  const renderProjectCards = (tab: ProjectsTabValue) => {
    const isMinePanel = tab === "mine";

    if (isInitialLoading) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          <p>Đang tải danh sách dự án...</p>
        </div>
      );
    }

    const cardProjects = filteredProjectSummaries;

    if (projectSummaries.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-base font-semibold text-foreground">
            {isMinePanel
              ? "Bạn chưa có dự án nào"
              : "Không tìm thấy dự án phù hợp"}
          </p>
          <p className="max-w-lg text-sm text-muted-foreground">
            {isMinePanel
              ? "Bắt đầu bằng cách tạo dự án đầu tiên hoặc tham gia nhóm mà bạn được mời."
              : "Hãy thử điều chỉnh bộ lọc hoặc tìm bằng từ khóa khác để thấy thêm dự án."}
          </p>
          {isMinePanel ? (
            <Button onClick={() => setCreateOpen(true)}>
              Tạo dự án đầu tiên
            </Button>
          ) : null}
        </div>
      );
    }

    if (cardProjects.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-base font-semibold text-foreground">
            Không tìm thấy dự án theo chuyên ngành đã chọn
          </p>
          <p className="max-w-lg text-sm text-muted-foreground">
            Hãy thử chọn chuyên ngành khác để xem thêm dự án.
          </p>
        </div>
      );
    }

    return cardProjects.map((summary) => {
      const statusStyle = getStatusStyle(summary.status);
      const cardColors = getProjectCardColorTokens(
        summary.specialization ?? null,
        summary.status
      );

      return (
        <ProjectCardV2
          key={summary.id}
          summary={summary}
          statusStyle={statusStyle}
          gradientClass={cardColors.gradient}
          statusTitleClass={cardColors.title}
          onClick={() => setDetailId(summary.id)}
        />
      );
    });
  };

  const renderTabPanel = (tab: ProjectsTabValue) => {
    const tabMeta = projectTabs[tab];
    const isMinePanel = tab === "mine";
    const disabledMineState = isMinePanel && !canViewMyProjects;

    if (disabledMineState) {
      return (
        <div className="rounded-xl border border-border bg-background px-6 py-12 text-center text-sm text-muted-foreground">
          Bạn cần đăng nhập bằng tài khoản sinh viên để xem dự án của mình.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="flex-1 space-y-4 sm:space-y-6">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <tabMeta.icon
                  className={cn("h-4 w-4 flex-shrink-0", tabMeta.accent)}
                />
                <span className="truncate">{tabMeta.label}</span>
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                {tabMeta.description}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isMinePanel && (
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700 whitespace-nowrap"
                >
                  Dự án của tôi
                </Badge>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => void refetchProjects()}
                disabled={isProjectsFetching}
                className="lg:hidden"
              >
                <RotateCwIcon
                  className={cn(
                    "h-4 w-4",
                    isProjectsFetching && "animate-spin"
                  )}
                  aria-hidden
                />
                <span className="sr-only">Làm mới</span>
              </Button>
            </div>
          </section>

          <section
            ref={scrollContainerRef}
            className="grid gap-4 md:gap-5 sm:grid-cols-2"
          >
            {renderProjectCards(tab)}

            {hasNextPage && (
              <div
                ref={loadMoreTriggerRef}
                className="col-span-full flex items-center justify-center py-8"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải thêm...</span>
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </div>
            )}
            {!hasNextPage && projectsContent.length > 0 && (
              <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                Đã hiển thị tất cả dự án
              </div>
            )}
          </section>
        </div>

        <ProjectFiltersSidebar
          nameFilter={nameFilter}
          onNameFilterChange={setNameFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          specializationFilter={specializationFilter}
          onSpecializationFilterChange={setSpecializationFilter}
          specializationOptions={specializationSelectOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          statusOptions={projectStatusFilterOptions}
        />
      </div>
    );
  };

  useEffect(() => {
    if (!selectedProject) {
      setInviteTarget(null);
      resetInviteForm();
    }
  }, [selectedProject, resetInviteForm]);

  useEffect(() => {
    if (!canInvite && inviteTarget) {
      setInviteTarget(null);
      resetInviteForm();
    }
  }, [canInvite, inviteTarget, resetInviteForm]);

  const makeFileKey = (file: File) =>
    `${file.name}-${file.size}-${file.lastModified ?? ""}`;

  const createPreviewItem = (file: File): PreviewItem => ({
    id: `preview-${
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    }`,
    name: file.name,
    size: file.size,
    previewUrl: URL.createObjectURL(file),
    file,
    fileType: file.type || "application/octet-stream",
  });

  const clearAttachmentPreviews = () => {
    filePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    imagePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setFilePreviews([]);
    setImagePreviews([]);
  };

  const handleImageFiles = (files: File[]) => {
    if (!files.length) return;

    setImagePreviews((prev) => {
      const existing = new Set(prev.map((item) => makeFileKey(item.file)));
      let mutated = false;
      const nextItems = [...prev];

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const key = makeFileKey(file);
        if (existing.has(key)) return;

        existing.add(key);
        mutated = true;
        nextItems.push(createPreviewItem(file));
      });

      return mutated ? nextItems : prev;
    });
  };

  const handleDocumentFiles = (files: File[]) => {
    if (!files.length) return;

    const imageCandidates: File[] = [];
    const documentCandidates: File[] = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        imageCandidates.push(file);
      } else {
        documentCandidates.push(file);
      }
    });

    if (imageCandidates.length) {
      handleImageFiles(imageCandidates);
    }

    if (!documentCandidates.length) return;

    setFilePreviews((prev) => {
      const existing = new Set(prev.map((item) => makeFileKey(item.file)));
      let mutated = false;
      const nextItems = [...prev];

      documentCandidates.forEach((file) => {
        const key = makeFileKey(file);
        if (existing.has(key)) return;

        existing.add(key);
        mutated = true;
        nextItems.push(createPreviewItem(file));
      });

      return mutated ? nextItems : prev;
    });
  };

  const onCreate = form.handleSubmit(async (values) => {
    try {
      const uploadedImages: Array<{ item: PreviewItem; url: string }> = [];

      for (const item of imagePreviews) {
        const response = await uploadImage({ file: item.file });
        const uploadedData = response.data;
        const uploadedUrl =
          typeof uploadedData === "string"
            ? uploadedData
            : uploadedData?.url ?? uploadedData?.path ?? null;

        if (!uploadedUrl) {
          throw new Error(
            `Không thể tải hình ảnh "${item.name}". Vui lòng thử lại.`
          );
        }

        uploadedImages.push({ item, url: uploadedUrl });
      }

      const uploadedFiles: Array<{ item: PreviewItem; path: string }> = [];

      for (const item of filePreviews) {
        const response = await uploadFile({ file: item.file });
        const uploadedData = response.data;
        const uploadedPath =
          typeof uploadedData === "string"
            ? uploadedData
            : uploadedData?.path ?? uploadedData?.url ?? null;

        if (!uploadedPath) {
          throw new Error(
            `Không thể tải tệp "${item.name}". Vui lòng thử lại.`
          );
        }

        uploadedFiles.push({ item, path: uploadedPath });
      }

      const filesPayload = uploadedFiles.map(({ item, path }) => ({
        filePath: path,
        type: item.fileType,
        fileType: item.fileType,
      }));

      const imagesPayload = uploadedImages.map(({ url }) => ({ url }));

      // Get major name from specialization value if majorId exists
      const major = values.majorId
        ? specializationValueToMajorMap.get(values.specialization)
        : null;
      const majorName =
        major?.name || values.specialization?.trim() || undefined;

      await createProject({
        name: values.name,
        majorId: values.majorId != null ? Number(values.majorId) : undefined,
        description: values.description ?? undefined,
        type: majorName,
        dueDate: values.dueDate || undefined,
        files: filesPayload.length ? filesPayload : undefined,
        images: imagesPayload.length ? imagesPayload : undefined,
      });

      await refetchProjects();

      toast({
        title: "Đã tạo dự án",
        description: `Dự án "${values.name}" đã được thêm thành công.`,
      });

      setCreateOpen(false);
      form.reset({
        name: "",
        description: "",
        dueDate: "",
        specialization: specializationInitialValue,
        majorId: undefined,
      });
      clearAttachmentPreviews();
    } catch (error: unknown) {
      toast({
        title: "Không thể tạo dự án",
        description: getErrorMessage(error, "Không thể tạo dự án"),
        variant: "destructive",
      });
    }
  });

  const onCloseCreateDialog = () => {
    setCreateOpen(false);
    form.reset({
      name: "",
      description: "",
      dueDate: "",
      specialization: specializationInitialValue,
      majorId: undefined,
    });
    clearAttachmentPreviews();
  };

  const onInvite = inviteForm.handleSubmit(async (values) => {
    if (!inviteTarget || !selectedProject || !canInvite) return;

    const email = values.email.trim();
    if (!email) return;

    if (selectedProjectApiId == null) {
      toast({
        title: "Không thể gửi lời mời",
        description: "Dự án không hợp lệ. Vui lòng thử lại.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await inviteMembers({
        projectId: selectedProjectApiId,
        emails: [email],
      });

      const successCount = response?.successCount ?? 0;
      const failedReasons = response?.failedReasons ?? [];
      const hasSuccess = successCount > 0;

      toast({
        title: hasSuccess ? "Đã gửi lời mời" : "Không thể gửi lời mời",
        description: hasSuccess
          ? `Đã gửi lời mời tới ${email} để tham gia ${
              inviteTarget === "member"
                ? "nhóm dự án"
                : "danh sách giảng viên hướng dẫn"
            } của dự án "${selectedProject.name}".`
          : failedReasons[0] ?? "Vui lòng thử lại sau.",
        variant: hasSuccess ? "default" : "destructive",
      });

      if (hasSuccess) {
        setInviteTarget(null);
        resetInviteForm();
      }

      if (selectedProjectApiId != null) {
        await refetchProjectDetail();
      }
    } catch (error: unknown) {
      toast({
        title: "Không thể gửi lời mời",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-8">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ProjectsTabValue)}
        className="space-y-6"
      >
        <TabsList className="grid w-full gap-2 rounded-2xl bg-muted/40 p-2 grid-cols-2 h-full">
          {projectTabOrder.map((tabKey) => {
            const tabMeta = projectTabs[tabKey];
            const Icon = tabMeta.icon;
            const disabled = tabKey === "mine" && !canViewMyProjects;
            return (
              <TabsTrigger
                key={tabKey}
                value={tabKey}
                disabled={disabled}
                className="group flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg sm:items-center"
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors group-data-[state=active]:text-white",
                    tabMeta.accent
                  )}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground transition-colors group-data-[state=active]:text-white sm:text-base">
                    {tabMeta.label}
                  </span>
                  <span className="hidden text-xs text-muted-foreground transition-colors group-data-[state=active]:text-white/90 sm:block">
                    {tabMeta.description}
                  </span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {projectTabOrder.map((tabKey) => (
          <TabsContent
            key={tabKey}
            value={tabKey}
            className="space-y-6 focus-visible:outline-none"
          >
            <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:rounded-[36px] sm:p-8">
              <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/30 blur-[120px]" />
              <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-sky-500/30 blur-[150px]" />
              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
                <div className="space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h1 className="text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
                      {isMentorView
                        ? "Theo dõi các dự án bạn đang cố vấn"
                        : "Tìm và khởi động dự án nghiên cứu chỉ trong vài phút"}
                    </h1>
                    <p className="text-sm text-slate-200 sm:text-base">
                      {isMentorView
                        ? "Cập nhật tiến độ học viên, trao đổi tài liệu và đẩy nhanh các mốc quan trọng."
                        : "Khám phá đề tài nổi bật, tạo dự án mới hoặc quản lý nhóm hiện tại với giao diện trực quan."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button
                      size="lg"
                      className="h-11 rounded-2xl px-5 text-base sm:h-12 sm:px-6"
                      onClick={() => setCreateOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Tạo dự án mới
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="lg"
                      className="h-11 rounded-2xl border border-white/30 bg-white/10 px-5 text-base text-white hover:bg-white/20 sm:h-12 sm:px-6"
                    >
                      <Link to={invitationsPath}>Quản lý lời mời</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {heroStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="h-fit rounded-2xl border border-white/20 bg-white/10 p-4 shadow-inner shadow-black/20 backdrop-blur sm:rounded-3xl sm:p-5"
                      >
                        <Icon className="h-5 w-5 text-white/80" />
                        <p className="mt-3 text-3xl font-semibold sm:mt-4 sm:text-4xl">
                          {stat.value}
                        </p>
                        <p className="text-xs text-white/90 sm:text-sm">
                          {stat.label}
                        </p>
                        <p className="text-[11px] text-white/70 sm:text-xs">
                          {stat.helper}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {renderTabPanel(tabKey)}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={createOpen}
        onOpenChange={(open) =>
          open ? setCreateOpen(true) : onCloseCreateDialog()
        }
      >
        <DialogContent className="max-h-[90vh] max-w-[calc(100vw-1.5rem)] overflow-y-auto border-none bg-white/95 p-0 shadow-2xl sm:max-w-4xl sm:rounded-[28px]">
          <div className="relative flex flex-col overflow-hidden bg-gradient-to-br from-white via-slate-50 to-sky-50">
            <div className="pointer-events-none absolute -left-48 -top-48 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-56 -right-44 h-[420px] w-[420px] rounded-full bg-sky-200/40 blur-[140px]" />

            <div className="relative px-8 pb-4 pt-14 sm:px-12 sm:pt-16">
              <DialogHeader className="space-y-4 text-left">
                <div className="space-y-2">
                  <DialogTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                    Tạo dự án mới
                  </DialogTitle>
                  <DialogDescription className="max-w-2xl text-sm leading-relaxed text-slate-600">
                    Điền đầy đủ thông tin, chọn hạn chót và đính kèm tài liệu để
                    nhóm luôn được cập nhật.
                  </DialogDescription>
                </div>
              </DialogHeader>
            </div>

            <form onSubmit={onCreate} className="relative flex flex-col">
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 px-8 pb-10 sm:px-12">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Chuyên ngành <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          control={form.control}
                          name="specialization"
                          render={({ field }) => (
                            <Select
                              value={field.value || undefined}
                              onValueChange={(value) => {
                                const major =
                                  specializationValueToMajorMap.get(value);
                                // Set specialization value (code/slug) to match option.value
                                field.onChange(value);
                                // Set majorId if major exists
                                if (major) {
                                  form.setValue("majorId", major.id);
                                } else {
                                  form.setValue("majorId", undefined);
                                }
                              }}
                              disabled={
                                specializationSelectOptions.length === 0
                              }
                            >
                              <SelectTrigger className="h-12 justify-between rounded-xl border border-slate-200 bg-white/95 px-4 text-left shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40">
                                <SelectValue placeholder="Chọn chuyên ngành" />
                              </SelectTrigger>
                              <SelectContent className="max-h-72 rounded-xl border border-white/70 bg-white/95 shadow-lg">
                                {specializationSelectOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="py-2 text-sm"
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.specialization && (
                          <p className="text-xs text-destructive">
                            {errors.specialization.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Tên dự án <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Nhập tên dự án"
                          className="h-12 rounded-xl border-none bg-white/95 shadow-sm ring-1 ring-inset ring-slate-200 transition focus-visible:ring-2 focus-visible:ring-primary/40"
                          {...form.register("name")}
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Mô tả
                        </label>
                        <Textarea
                          placeholder="Mô tả ngắn gọn mục tiêu, phạm vi và yêu cầu chính"
                          rows={4}
                          className="rounded-xl border-none bg-white/95 shadow-sm ring-1 ring-inset ring-slate-200 transition focus-visible:ring-2 focus-visible:ring-primary/40"
                          {...form.register("description")}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Hạn nộp (nếu có)
                        </label>
                        <Controller
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return (
                              <DatePicker
                                value={field.value}
                                onChange={(value) =>
                                  field.onChange(value ?? "")
                                }
                                onBlur={field.onBlur}
                                placeholder="Chọn hạn nộp"
                                formatter={dateFormatter}
                                fromDate={today}
                                className="h-12 rounded-xl border-none bg-white/95 text-sm shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-white focus-visible:ring-2 focus-visible:ring-primary/40"
                              />
                            );
                          }}
                        />
                        {errors.dueDate && (
                          <p className="text-xs text-destructive">
                            {errors.dueDate.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Thêm hạn chót giúp nhắc nhở cả nhóm bám sát tiến độ.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Tài liệu đính kèm (PDF, DOCX...)
                        </label>
                        <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-sky-200/20" />
                          <label
                            htmlFor="project-documents"
                            className="relative flex cursor-pointer flex-col items-center gap-2 px-5 py-7 text-center text-sm text-muted-foreground transition hover:bg-primary/5"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              handleDocumentFiles(
                                Array.from(event.dataTransfer.files || [])
                              );
                            }}
                          >
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                              <UploadIcon className="h-7 w-7" />
                            </span>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-primary">
                                Kéo thả tài liệu vào đây
                              </p>
                              <p>hoặc nhấp để chọn từ máy</p>
                            </div>
                            <input
                              id="project-documents"
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(event) => {
                                handleDocumentFiles(
                                  Array.from(event.target.files || [])
                                );
                                event.target.value = "";
                              }}
                            />
                          </label>

                          {filePreviews.length > 0 && (
                            <div className="relative border-t border-primary/20 bg-white/95 p-3">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Tài liệu đã chọn
                              </p>
                              <div className="mt-3 grid gap-3">
                                {filePreviews.map((item) => (
                                  <figure
                                    key={item.id}
                                    className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs shadow-sm"
                                  >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                      <FileIcon className="h-5 w-5" />
                                    </span>
                                    <figcaption className="flex flex-1 items-start justify-between gap-2 overflow-hidden">
                                      <div className="flex-1 truncate text-left">
                                        <p
                                          className="truncate font-medium"
                                          title={item.name}
                                        >
                                          {item.name}
                                        </p>
                                        <p className="text-[10px] uppercase text-muted-foreground">
                                          {item.fileType || "Không rõ"}
                                        </p>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-[11px]"
                                        onClick={() => {
                                          setFilePreviews((prev) =>
                                            prev.filter(
                                              (preview) =>
                                                preview.id !== item.id
                                            )
                                          );
                                          URL.revokeObjectURL(item.previewUrl);
                                        }}
                                      >
                                        Xóa
                                      </Button>
                                    </figcaption>
                                  </figure>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Hình ảnh minh họa
                        </label>
                        <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/30 via-transparent to-primary/10" />
                          <label
                            htmlFor="project-images"
                            className="relative flex cursor-pointer flex-col items-center gap-2 px-5 py-7 text-center text-sm text-muted-foreground transition hover:bg-primary/5"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              handleImageFiles(
                                Array.from(event.dataTransfer.files || [])
                              );
                            }}
                          >
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-primary shadow-inner">
                              <UploadIcon className="h-7 w-7" />
                            </span>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-primary">
                                Kéo thả hình ảnh vào đây
                              </p>
                              <p>hoặc nhấp để chọn từ máy</p>
                            </div>
                            <input
                              id="project-images"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(event) => {
                                handleImageFiles(
                                  Array.from(event.target.files || [])
                                );
                                event.target.value = "";
                              }}
                            />
                          </label>

                          {imagePreviews.length > 0 && (
                            <div className="relative border-t border-primary/20 bg-white/95 p-3">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Hình ảnh đã chọn
                              </p>
                              <div className="mt-3 grid gap-3">
                                {imagePreviews.map((item) => (
                                  <figure
                                    key={item.id}
                                    className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs shadow-sm"
                                  >
                                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-sky-100">
                                      <img
                                        src={item.previewUrl}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </span>
                                    <figcaption className="flex flex-1 items-start justify-between gap-2">
                                      <div className="flex-1 truncate text-left">
                                        <p
                                          className="truncate font-medium"
                                          title={item.name}
                                        >
                                          {item.name}
                                        </p>
                                        <p className="text-[10px] uppercase text-muted-foreground">
                                          {item.fileType || "image"}
                                        </p>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-[11px]"
                                        onClick={() => {
                                          setImagePreviews((prev) =>
                                            prev.filter(
                                              (preview) =>
                                                preview.id !== item.id
                                            )
                                          );
                                          URL.revokeObjectURL(item.previewUrl);
                                        }}
                                      >
                                        Xóa
                                      </Button>
                                    </figcaption>
                                  </figure>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="border-t border-white/60 bg-white/90 px-8 py-5 backdrop-blur sm:px-12">
                <DialogFooter className="gap-3 sm:gap-4">
                  <Button
                    type="submit"
                    className="min-w-[150px] rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg transition hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                    disabled={isSubmitting || isCreating || isUploading}
                  >
                    {isSubmitting || isCreating || isUploading
                      ? "Đang xử lý..."
                      : "Tạo dự án"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl border-none bg-white/70 text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-white"
                    onClick={onCloseCreateDialog}
                    disabled={isSubmitting || isCreating || isUploading}
                  >
                    Hủy
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <StudentProjectDetailDialog
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        selectedProject={selectedProject}
        selectedMeta={selectedMeta}
        isDetailBusy={isDetailBusy}
        showDetailError={showDetailError}
        isDetailEmpty={isDetailEmpty}
        detailStatus={detailStatus}
        detailStatusStyle={detailStatusStyle}
        selectedProjectSpecialization={selectedProjectSpecialization}
        DetailSpecializationIcon={DetailSpecializationIcon}
        canInvite={canInvite}
        onInviteClick={setInviteTarget}
        canPick={isArchived}
        onPickProject={() => setPickProjectDialogOpen(true)}
        canResubmit={
          detailStatus === "revisionrequired" && selectedProjectApiId != null
        }
        onResubmit={() => {
          if (selectedProjectApiId != null) {
            setResubmitProjectId(selectedProjectApiId);
            setResubmitProjectDialogOpen(true);
          }
        }}
        projectId={selectedProjectApiId}
        onRemoveMember={handleRemoveMember}
        isRemovingMember={deleteMemberMutation.isPending}
        ownerAccountId={selectedProjectOwnerId}
      />

      <PickProjectDialog
        open={pickProjectDialogOpen}
        onOpenChange={setPickProjectDialogOpen}
        projectName={selectedProject?.name ?? "Dự án"}
        projectDescription={selectedProject?.description}
        projectType={
          selectedProject?.specializationValue ??
          selectedProject?.summary.specialization?.value
        }
        projectMajorId={(() => {
          const majorName =
            selectedProject?.specializationValue ??
            selectedProject?.summary.specialization?.value;
          if (majorName && majors) {
            const foundMajor = majors.find(
              (major) => major.name?.toLowerCase() === majorName.toLowerCase()
            );
            return foundMajor?.id ?? null;
          }
          return null;
        })()}
        projectDueDate={selectedProject?.dueDate}
        onSubmit={async (data) => {
          if (!selectedProject?.apiId) {
            throw new Error("Không tìm thấy mã dự án");
          }
          await pickProjectMutation.mutateAsync({
            id: selectedProject.apiId,
            payload: data,
          });
        }}
        isSubmitting={pickProjectMutation.isPending}
      />

      <ResubmitProjectDialog
        open={resubmitProjectDialogOpen}
        onOpenChange={setResubmitProjectDialogOpen}
        projectName={resubmitProject?.summary.name ?? "Dự án"}
        projectDescription={resubmitProject?.summary.description}
        projectType={
          resubmitProject?.specializationValue ??
          resubmitProject?.summary.specialization?.value
        }
        projectMajorId={(() => {
          const majorName =
            resubmitProject?.specializationValue ??
            resubmitProject?.summary.specialization?.value;
          if (majorName && majors) {
            const foundMajor = majors.find(
              (major) => major.name?.toLowerCase() === majorName.toLowerCase()
            );
            return foundMajor?.id ?? null;
          }
          return null;
        })()}
        projectDueDate={resubmitProject?.detail.dueDate ?? undefined}
        onSubmit={async (data) => {
          if (!resubmitProjectId) {
            throw new Error("Không tìm thấy mã dự án");
          }
          await resubmitProjectMutation.mutateAsync({
            id: resubmitProjectId,
            payload: data,
          });
        }}
        isSubmitting={resubmitProjectMutation.isPending}
      />

      <Dialog
        open={Boolean(inviteTarget && canInvite)}
        onOpenChange={(open) => {
          if (!open) {
            setInviteTarget(null);
            resetInviteForm();
          } else if (!canInvite) {
            setInviteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-sm">
          {inviteTarget && (
            <div className="space-y-4">
              <DialogHeader className="space-y-1.5">
                <DialogTitle>
                  {inviteTarget === "member"
                    ? "Mời thành viên mới"
                    : "Mời giảng viên hướng dẫn"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Nhập email để gửi lời mời tham gia dự án
                  {selectedProject ? ` "${selectedProject.name}".` : "."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={onInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="nhap.email@truong.edu.vn"
                    {...inviteForm.register("email")}
                  />
                  {inviteErrors.email && (
                    <p className="text-xs text-destructive">
                      {inviteErrors.email.message}
                    </p>
                  )}
                </div>

                <DialogFooter className="pt-1">
                  <Button
                    type="submit"
                    disabled={isInviteProcessing}
                    className="min-w-[120px]"
                  >
                    {isInviteProcessing ? "Đang gửi..." : "Gửi lời mời"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setInviteTarget(null);
                      resetInviteForm();
                    }}
                    disabled={isInviteProcessing}
                  >
                    Hủy
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function StudentProjects() {
  return (
    <StudentLayout>
      <ProjectsPageContent variant="student" />
    </StudentLayout>
  );
}
