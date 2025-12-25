import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthAccountStore } from "@/lib/auth-store";
import type { SubmissionAsset, UserSummary } from "@/lib/project-types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowDownToLineIcon,
  Clock,
  ExternalLinkIcon,
  Folder,
  FolderOpenDot,
  PaperclipIcon,
  ShieldAlert,
  UserPlusIcon,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

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
  readonly value: string;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly gradient: string;
  readonly accent: string;
};

type NormalizedProject = {
  id: string;
  name: string;
  description: string;
  status: string;
  specialization: SpecializationOption | null;
};

interface StudentProjectDetailDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly selectedProject: NormalizedProject | null;
  readonly selectedMeta: ProjectDetailMeta | null;
  readonly isDetailBusy: boolean;
  readonly showDetailError: boolean;
  readonly isDetailEmpty: boolean;
  readonly detailStatus: string;
  readonly detailStatusStyle: {
    label: string;
    badge: string;
    dot: string;
    card: string;
  };
  readonly selectedProjectSpecialization: SpecializationOption | null;
  readonly DetailSpecializationIcon: LucideIcon | null;
  readonly canInvite: boolean;
  readonly onInviteClick: (target: "member" | "mentor") => void;
  readonly onPickProject?: () => void;
  readonly canPick?: boolean;
  readonly onResubmit?: () => void;
  readonly canResubmit?: boolean;
  readonly projectId?: number | null;
  readonly onRemoveMember?: (memberId: number) => Promise<void>;
  readonly isRemovingMember?: boolean;
  readonly ownerAccountId?: string | null;
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function StudentProjectDetailDialog({
  open,
  onOpenChange,
  selectedProject,
  selectedMeta,
  isDetailBusy,
  showDetailError,
  isDetailEmpty,
  detailStatus,
  detailStatusStyle,
  selectedProjectSpecialization,
  DetailSpecializationIcon,
  canInvite,
  onInviteClick,
  onPickProject,
  canPick = false,
  onResubmit,
  canResubmit = false,
  projectId,
  onRemoveMember,
  isRemovingMember = false,
  ownerAccountId,
}: StudentProjectDetailDialogProps) {
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const currentAccountId = useAuthAccountStore(
    (state) => state.account?.id ?? null
  );
  const currentAccountIdString =
    currentAccountId != null ? String(currentAccountId) : null;

  const isOwner = useMemo(() => {
    if (!ownerAccountId || !currentAccountIdString) return false;
    return ownerAccountId === currentAccountIdString;
  }, [ownerAccountId, currentAccountIdString]);

  const headerGradient = selectedProjectSpecialization?.gradient
    ? `bg-gradient-to-r ${selectedProjectSpecialization.gradient}`
    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600";

  const handleRemoveClick = (member: ProjectMemberInfo) => {
    // Parse member.id (string) to number (accountId)
    const memberId = Number.parseInt(member.id, 10);
    if (Number.isNaN(memberId)) {
      return;
    }
    setMemberToRemove({ id: memberId, name: member.name });
    setRemoveConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove || !onRemoveMember) {
      return;
    }
    try {
      await onRemoveMember(memberToRemove.id);
      setRemoveConfirmOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden flex flex-col p-0 sm:max-w-2xl">
        {selectedProject && (
          <>
            {selectedMeta && !isDetailBusy && (
              <DialogHeader
                className={cn(
                  "relative overflow-hidden border-b px-6 py-5 shadow-lg sm:px-8 sm:py-6",
                  headerGradient,
                  "border-blue-600/20"
                )}
              >
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg shrink-0">
                        {DetailSpecializationIcon ? (
                          <DetailSpecializationIcon className="h-6 w-6 text-white" />
                        ) : (
                          <Folder className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                          {selectedProject.name}
                        </DialogTitle>
                        {selectedProjectSpecialization && (
                          <span
                            className={cn(
                              "mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white"
                            )}
                          >
                            {selectedProjectSpecialization.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                      {selectedMeta.createdAt && (
                        <span>Ngày tạo: {selectedMeta.createdAt}</span>
                      )}
                      {selectedMeta.updatedAt && (
                        <span>Cập nhật: {selectedMeta.updatedAt}</span>
                      )}
                      {selectedMeta.dueDate && (
                        <span>Hạn chót: {selectedMeta.dueDate}</span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-sm px-4 py-2 font-semibold shadow-lg bg-white/90 backdrop-blur-sm capitalize",
                      detailStatusStyle.badge
                    )}
                  >
                    <span
                      className={cn(
                        "mr-1.5 h-2 w-2 rounded-full",
                        detailStatusStyle.dot
                      )}
                    />
                    {detailStatusStyle.label}
                  </Badge>
                </div>
              </DialogHeader>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 sm:px-8">
              <div className="space-y-6">
                {isDetailBusy && (
                  <div className="space-y-4 rounded-md border border-border/70 bg-muted/10 p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Skeleton className="h-24 rounded-md" />
                      <Skeleton className="h-24 rounded-md" />
                    </div>
                    <Skeleton className="h-20 rounded-md" />
                  </div>
                )}

                {!isDetailBusy && showDetailError && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                    Không thể tải thông tin dự án. Vui lòng thử lại sau.
                  </div>
                )}

                {!isDetailBusy && isDetailEmpty && (
                  <div className="rounded-md border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-700">
                    Không tìm thấy thông tin chi tiết cho dự án này.
                  </div>
                )}

                {selectedMeta && !isDetailBusy && (
                  <>
                    {detailStatus === "pending" ? (
                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs font-medium text-amber-700">
                        <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div className="space-y-1">
                          <span className="block font-semibold text-amber-800">
                            Dự án đang chờ hội đồng duyệt
                          </span>
                          <span className="block text-[11px] font-medium text-amber-700/90">
                            Bạn chỉ có thể thao tác sau khi hội đồng phê duyệt
                            dự án này.
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <section className="space-y-3 rounded-md border border-border/70 bg-muted/10 p-4">
                      <header className="text-sm font-semibold">Mô tả</header>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedProject.description ||
                          "Chưa có mô tả cho dự án này."}
                      </p>
                    </section>

                    <section className="space-y-3 rounded-md border border-border/70 bg-muted/10 p-4">
                      <header className="space-y-2">
                        <div className="text-sm font-semibold">Nhóm dự án</div>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>
                            {(selectedMeta.leader ? 1 : 0) +
                              selectedMeta.collaborators.length}{" "}
                            thành viên
                          </span>
                          {canInvite ? (
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 px-3 text-xs gap-1.5"
                              onClick={() => onInviteClick("member")}
                            >
                              <UserPlusIcon className="h-4 w-4" />
                              Mời
                            </Button>
                          ) : null}
                        </div>
                      </header>

                      {selectedMeta.leader && (
                        <div className="rounded-md border border-border/70 bg-background/70 p-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback
                                className="text-xs font-semibold text-background"
                                style={{
                                  backgroundColor:
                                    selectedMeta.leader.avatarColor,
                                }}
                              >
                                {getInitials(selectedMeta.leader.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5 text-sm">
                              <p className="font-semibold">
                                {selectedMeta.leader.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedMeta.leader.email}
                              </p>
                              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-px text-[11px] font-medium text-primary">
                                Trưởng nhóm
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedMeta.collaborators.length > 0 ? (
                        <div className="space-y-2">
                          {selectedMeta.collaborators.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
                            >
                              <Avatar className="h-9 w-9">
                                <AvatarFallback
                                  className="text-xs font-semibold text-background"
                                  style={{
                                    backgroundColor: member.avatarColor,
                                  }}
                                >
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-1 items-start justify-between gap-3">
                                <div className="space-y-0.5">
                                  <p className="font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {member.email}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {member.inviteStatus?.toLowerCase() ===
                                  "pending" ? (
                                    <Badge className="bg-amber-100 text-amber-700">
                                      Chờ xác nhận
                                    </Badge>
                                  ) : null}
                                  {isOwner &&
                                    onRemoveMember &&
                                    projectId != null && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() =>
                                          handleRemoveClick(member)
                                        }
                                        disabled={isRemovingMember}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Chưa có thành viên nào khác ngoài trưởng nhóm.
                        </p>
                      )}
                    </section>

                    <section className="space-y-3 rounded-md border border-border/70 bg-muted/10 p-4">
                      <header className="space-y-2">
                        <div className="text-sm font-semibold">
                          Giảng viên hướng dẫn
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>{selectedMeta.mentors.length} người</span>
                          {canInvite ? (
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 px-3 text-xs gap-1.5"
                              onClick={() => onInviteClick("mentor")}
                            >
                              <UserPlusIcon className="h-4 w-4" />
                              Mời
                            </Button>
                          ) : null}
                        </div>
                      </header>

                      {selectedMeta.mentors.length > 0 ? (
                        <div className="space-y-2">
                          {selectedMeta.mentors.map((mentor) => (
                            <div
                              key={mentor.id}
                              className="flex items-center gap-3 rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
                            >
                              <Avatar className="h-9 w-9">
                                <AvatarFallback
                                  className="text-xs font-semibold text-background"
                                  style={{
                                    backgroundColor: mentor.avatarColor,
                                  }}
                                >
                                  {getInitials(mentor.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-0.5">
                                <p className="font-medium">{mentor.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {mentor.email}
                                </p>
                              </div>
                              <div className="ml-auto flex flex-col items-end gap-1">
                                <Badge className="bg-sky-100 text-sky-700">
                                  Mentor
                                </Badge>
                                {mentor.inviteStatus?.toLowerCase() ===
                                "pending" ? (
                                  <Badge className="bg-amber-100 text-amber-700">
                                    Chờ xác nhận
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Chưa có giảng viên hướng dẫn.
                        </p>
                      )}
                    </section>

                    <section className="space-y-3 rounded-md border border-border/70 bg-muted/10 p-4">
                      <header className="flex items-center justify-between text-sm font-semibold">
                        <span>Tệp đính kèm</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedMeta.attachments.length} tệp
                        </span>
                      </header>

                      {selectedMeta.attachments.length > 0 ? (
                        <div className="grid gap-2 md:grid-cols-2">
                          {selectedMeta.attachments.map((asset) => {
                            const isDownload = asset.type === "file";
                            return (
                              <a
                                key={asset.id}
                                href={asset.url}
                                target={isDownload ? "_self" : "_blank"}
                                rel="noreferrer"
                                download={isDownload ? asset.name : undefined}
                                className="flex items-center gap-3 rounded-md border border-border/70 bg-background px-3 py-2 text-sm transition hover:border-primary/60 hover:text-primary"
                              >
                                <span className="rounded-md bg-primary/10 p-2 text-primary">
                                  {isDownload ? (
                                    <ArrowDownToLineIcon className="h-4 w-4" />
                                  ) : (
                                    <ExternalLinkIcon className="h-4 w-4" />
                                  )}
                                </span>
                                <div className="flex-1 space-y-0.5">
                                  <p className="line-clamp-1 font-medium max-w-[200px] truncate">
                                    {asset.name}
                                  </p>
                                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <PaperclipIcon className="h-3 w-3" />
                                    {asset.type === "link" ? "Liên kết" : "Tệp"}
                                  </p>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Chưa có tệp đính kèm.
                        </p>
                      )}
                    </section>

                    {canPick && onPickProject && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <FolderOpenDot className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">
                                Dự án đã lưu trữ
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Bạn có thể chọn dự án này và cung cấp thông tin
                                bổ sung để tạo lại dự án.
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={onPickProject}
                              className="w-full sm:w-auto"
                            >
                              Chọn dự án này
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {canResubmit && onResubmit && (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-amber-100 p-2">
                              <ShieldAlert className="h-5 w-5 text-amber-700" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                  Yêu cầu sửa đổi
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Dự án của bạn cần được sửa đổi. Vui lòng cập
                                  nhật thông tin và nộp lại để được xem xét.
                                </p>
                              </div>

                              {selectedMeta?.revisionDeadline && (
                                <div className="flex items-center gap-2 rounded-md bg-amber-100/50 px-3 py-2">
                                  <Clock className="h-4 w-4 text-amber-700 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-amber-800">
                                      Hạn nộp lại
                                    </p>
                                    <p className="text-xs text-amber-700">
                                      {selectedMeta.revisionDeadline}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {selectedMeta?.rejectionReason && (
                                <div className="space-y-1.5 rounded-md bg-white/60 px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0" />
                                    <p className="text-xs font-semibold text-amber-800">
                                      Lý do từ chối
                                    </p>
                                  </div>
                                  <p className="text-xs text-amber-700 leading-relaxed pl-6">
                                    {selectedMeta.rejectionReason}
                                  </p>
                                </div>
                              )}

                              {selectedMeta?.rejectionFeedback && (
                                <div className="space-y-1.5 rounded-md bg-white/60 px-3 py-2">
                                  <p className="text-xs font-semibold text-amber-800">
                                    Phản hồi chi tiết
                                  </p>
                                  <p className="text-xs text-amber-700 leading-relaxed">
                                    {selectedMeta.rejectionFeedback}
                                  </p>
                                </div>
                              )}

                              <Button
                                type="button"
                                onClick={onResubmit}
                                className="w-full sm:w-auto"
                                variant="default"
                              >
                                Nộp lại
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>

      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thành viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thành viên{" "}
              <span className="font-semibold">{memberToRemove?.name}</span> khỏi
              dự án này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingMember}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              disabled={isRemovingMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemovingMember ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
