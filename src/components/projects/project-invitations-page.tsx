import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { formatDateDisplay } from "@/lib/date-utils";
import { getErrorMessage } from "@/lib/utils";
import {
  useApproveProjectInvitationMutation,
  useProjectInvitationsQuery,
  useRejectProjectInvitationMutation,
} from "@/services/project-member";
import type { ProjectInvitation } from "@/services/types/project-member";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  MailPlus,
  RefreshCw,
  UserPlus,
  UsersIcon,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Chờ xác nhận",
    className: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Đã chấp nhận",
    className: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Đã từ chối",
    className: "bg-rose-100 text-rose-700",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-600",
  },
};

const statusIconMap: Record<string, LucideIcon> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  cancelled: Info,
};

const getStatusStyle = (status?: string | null) => {
  if (!status) return statusStyles.pending;
  const key = status.toLowerCase();
  return (
    statusStyles[key] ?? {
      label: status,
      className: "bg-slate-100 text-slate-600",
    }
  );
};

const getVariantCopy = (variant: "student" | "mentor") =>
  variant === "mentor"
    ? {
        title: "Lời mời tham gia dự án",
        description:
          "Quản lý lời mời tham gia các dự án mentoring và phản hồi kịp thời.",
      }
    : {
        title: "Lời mời tham gia dự án",
        description:
          "Kiểm tra và phản hồi các lời mời tham gia dự án mà bạn nhận được.",
      };

export function ProjectInvitationsPageContent({
  variant = "student",
}: {
  readonly variant?: "student" | "mentor";
}) {
  const { toast } = useToast();
  const { data, isLoading, isFetching, refetch } = useProjectInvitationsQuery();
  const { mutateAsync: approveInvitation, isPending: isApproving } =
    useApproveProjectInvitationMutation();
  const { mutateAsync: rejectInvitation, isPending: isRejecting } =
    useRejectProjectInvitationMutation();

  const [pendingAction, setPendingAction] = useState<{
    readonly id: number;
    readonly type: "approve" | "reject";
  } | null>(null);

  const invitations = useMemo<ProjectInvitation[]>(
    () =>
      (data ?? []).map((invitation, index) => ({
        id: invitation.id ?? index,
        projectId: invitation.projectId ?? null,
        projectName: invitation.projectName ?? "Dự án chưa có tên",
        projectDescription: invitation.projectDescription ?? null,
        projectType: invitation.projectType ?? null,
        projectStatus: invitation.projectStatus ?? null,
        memberRole: invitation.memberRole ?? null,
        status: invitation.status ?? null,
        ownerName: invitation.ownerName ?? null,
        ownerEmail: invitation.ownerEmail ?? null,
        createDate: invitation.createDate ?? null,
        dueDate: invitation.dueDate ?? null,
      })),
    [data]
  );

  const isRefreshing = isFetching && !isLoading;

  const invitationStats = useMemo(() => {
    const total = invitations.length;
    const pending = invitations.filter(
      (item) => (item.status ?? "").toLowerCase() === "pending"
    ).length;
    const approved = invitations.filter(
      (item) => (item.status ?? "").toLowerCase() === "approved"
    ).length;
    const rejected = invitations.filter(
      (item) => (item.status ?? "").toLowerCase() === "rejected"
    ).length;
    const cancelled = invitations.filter(
      (item) => (item.status ?? "").toLowerCase() === "cancelled"
    ).length;

    return { total, pending, approved, rejected, cancelled };
  }, [invitations]);

  const summaryItems = useMemo(
    () => [
      {
        label: "Tổng lời mời",
        value: invitationStats.total,
        hint: "Tính cả lời mời đã phản hồi",
        icon: MailPlus,
      },
      {
        label: "Chờ phản hồi",
        value: invitationStats.pending,
        hint: "Ưu tiên xử lý để không bỏ lỡ dự án",
        icon: Clock,
      },
      {
        label: "Đã chấp nhận",
        value: invitationStats.approved,
        hint: "Những dự án bạn đã tham gia",
        icon: CheckCircle2,
      },
    ],
    [invitationStats]
  );

  const handleApprove = async (invitation: ProjectInvitation) => {
    if (invitation.id == null) {
      toast({
        title: "Không thể xử lý lời mời",
        description: "Lời mời không hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPendingAction({ id: invitation.id, type: "approve" });
      await approveInvitation(invitation.id);
      toast({
        title: "Đã chấp nhận lời mời",
        description: `Bạn đã tham gia dự án "${invitation.projectName}".`,
      });
      await refetch();
    } catch (error: unknown) {
      toast({
        title: "Không thể chấp nhận lời mời",
        description: getErrorMessage(error, "Đã có lỗi xảy ra"),
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleReject = async (invitation: ProjectInvitation) => {
    if (invitation.id == null) {
      toast({
        title: "Không thể xử lý lời mời",
        description: "Lời mời không hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPendingAction({ id: invitation.id, type: "reject" });
      await rejectInvitation(invitation.id);
      toast({
        title: "Đã từ chối lời mời",
        description: `Bạn đã từ chối dự án "${invitation.projectName}".`,
      });
      await refetch();
    } catch (error: unknown) {
      toast({
        title: "Không thể từ chối lời mời",
        description: getErrorMessage(error, "Đã có lỗi xảy ra"),
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const { title, description } = getVariantCopy(variant);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <MailPlus className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {description}
                {isRefreshing && (
                  <span className="ml-2 text-xs text-primary">
                    Đang cập nhật...
                  </span>
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Làm mới
            </Button>
          </div>
        </div>

        {!isLoading && invitations.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {summaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className="border-border/60 bg-background/70 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        {item.value}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80">
                        {item.hint}
                      </p>
                    </div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải lời mời...
            </CardContent>
          </Card>
        ) : invitations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-sm text-muted-foreground">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-muted/40 text-muted-foreground">
                <UserPlus className="h-7 w-7" />
              </span>
              <div className="space-y-1 text-center">
                <p className="text-base font-medium text-foreground">
                  Hiện chưa có lời mời nào.
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Khi giảng viên hoặc thành viên khác mời bạn tham gia dự án,
                  thông tin sẽ xuất hiện tại đây.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void refetch()}
              >
                Thử làm mới danh sách
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" role="list" aria-live="polite">
            {invitations.map((invitation) => {
              const isPending =
                (invitation.status ?? "").toLowerCase() === "pending";
              const statusStyle = getStatusStyle(invitation.status);
              const createdAtLabel =
                formatDateDisplay(invitation.createDate) ?? "Chưa rõ";
              const dueDateLabel = formatDateDisplay(invitation.dueDate);
              const statusKey = (invitation.status ?? "").toLowerCase();
              const StatusIcon = statusIconMap[statusKey] ?? Info;
              return (
                <Card
                  key={invitation.id}
                  className="group border-border/60 bg-background/70 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <CardContent className="space-y-4 p-5" role="listitem">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold text-foreground">
                            {invitation.projectName}
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {invitation.ownerName
                              ? `Người mời: ${invitation.ownerName}`
                              : "Chưa rõ người mời"}
                          </span>
                          {invitation.ownerEmail && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                  aria-label={`Email người mời ${invitation.ownerEmail}`}
                                >
                                  <Info className="h-3 w-3" />
                                  <span>{invitation.ownerEmail}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Email người mời: {invitation.ownerEmail}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                      <Badge className={statusStyle.className}>
                        <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                        {statusStyle.label}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground/90">
                      {invitation.projectDescription ? (
                        <span className="line-clamp-2">
                          {invitation.projectDescription}
                        </span>
                      ) : (
                        "Chưa có mô tả chi tiết cho lời mời này."
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 rounded-md bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5" />
                        {invitation.projectType ?? "Không rõ loại dự án"}
                      </span>
                      <span>Gửi ngày: {createdAtLabel}</span>
                      {dueDateLabel && (
                        <span>Hạn phản hồi: {dueDateLabel}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(invitation)}
                            disabled={
                              (pendingAction &&
                                pendingAction.id !== invitation.id) ||
                              (pendingAction?.id === invitation.id &&
                                pendingAction.type === "approve") ||
                              isApproving
                            }
                            className="shadow-sm"
                            aria-label={`Chấp nhận lời mời dự án ${invitation.projectName}`}
                          >
                            {pendingAction?.id === invitation.id &&
                            pendingAction?.type === "approve" &&
                            isApproving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang chấp nhận...
                              </>
                            ) : (
                              "Chấp nhận"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleReject(invitation)}
                            disabled={
                              (pendingAction &&
                                pendingAction.id !== invitation.id) ||
                              (pendingAction?.id === invitation.id &&
                                pendingAction.type === "reject") ||
                              isRejecting
                            }
                            className="shadow-sm"
                            aria-label={`Từ chối lời mời dự án ${invitation.projectName}`}
                          >
                            {pendingAction?.id === invitation.id &&
                            pendingAction?.type === "reject" &&
                            isRejecting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang từ chối...
                              </>
                            ) : (
                              "Từ chối"
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="pointer-events-none text-muted-foreground"
                          disabled
                          aria-label={`Đã phản hồi lời mời dự án ${invitation.projectName}`}
                        >
                          Đã phản hồi lời mời này
                        </Button>
                      )}
                      {dueDateLabel && isPending && (
                        <Badge
                          variant="outline"
                          className="ml-auto text-[11px]"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Ưu tiên phản hồi trước hạn
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
