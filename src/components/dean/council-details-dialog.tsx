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
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CouncilDto } from "@/services/types";
import { Mail, Trash2 } from "lucide-react";
import { useState } from "react";

export function councilStatusPresentation(status?: string | null): {
  label: string;
  variant: BadgeProps["variant"];
  className?: string;
} {
  const normalized = (status ?? "").toString().toLowerCase();

  switch (normalized) {
    case "draft":
      return {
        label: "Nháp",
        variant: "outline",
        className:
          "border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      };
    case "pending":
      return {
        label: "Đang chờ",
        variant: "outline",
        className:
          "border-transparent bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100",
      };
    case "active":
      return {
        label: "Hoạt động",
        variant: "outline",
        className:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
      };
    case "inactive":
      return {
        label: "Không hoạt động",
        variant: "outline",
        className:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
      };
    case "archived":
      return {
        label: "Lưu trữ",
        variant: "outline",
        className:
          "border-purple-200 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
      };
    case "revisionrequired":
      return {
        label: "Yêu cầu sửa đổi",
        variant: "outline",
        className:
          "border-yellow-200 bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
      };
    case "scored":
      return {
        label: "Đã chấm điểm",
        variant: "default",
        className:
          "border-purple-200 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
      };
    default:
      return {
        label: status ?? "Chưa xác định",
        variant: "outline",
        className:
          "border-gray-300 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      };
  }
}

export interface CouncilDetailsDialogProps {
  readonly council?: CouncilDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onEdit?: (council: CouncilDto) => void;
  readonly onRemoveMember?: (councilId: number, lecturerId: number) => void;
  readonly isRemovingMember?: boolean;
  readonly isLoading?: boolean;
}

export function CouncilDetailsDialog({
  council,
  open,
  onOpenChange,
  onEdit,
  onRemoveMember,
  isRemovingMember = false,
  isLoading = false,
}: CouncilDetailsDialogProps) {
  const members = council?.members ?? [];
  const statusChip = councilStatusPresentation(council?.status);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<{
    councilId: number;
    lecturerId: number;
    lecturerName: string;
  } | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-6 sm:max-w-2xl">
        <DialogHeader className="space-y-1">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </>
          ) : (
            <>
              <DialogTitle>
                {council?.councilName ?? "Chi tiết hội đồng"}
              </DialogTitle>
              <DialogDescription>
                {council?.department ? `Khoa ${council.department}` : ""}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <section>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </section>
            <section>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </section>
            <section>
              <Skeleton className="h-3 w-32 mb-2" />
              <div className="space-y-3 mt-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2"
                  >
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Mã hội đồng
              </h3>
              <p className="mt-1 text-sm font-medium text-foreground">
                {council?.councilCode ?? "—"}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Trạng thái
              </h3>
              <Badge
                variant={statusChip.variant}
                className={cn("mt-1 w-fit capitalize", statusChip.className)}
              >
                {statusChip.label}
              </Badge>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Thành viên ({members.length})
              </h3>
              {members.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Hội đồng chưa có thành viên.
                </p>
              ) : (
                <ScrollArea className="mt-3 max-h-72 pr-3">
                  <ul className="space-y-3">
                    {members.map((member) => {
                      const displayName =
                        member.lecturerName ??
                        member.lecturerEmail ??
                        "Không rõ tên";
                      const displayEmail = member.lecturerEmail ?? "—";
                      const initials = (
                        member.lecturerName ??
                        member.lecturerEmail ??
                        "?"
                      )
                        .split(" ")
                        .slice(-2)
                        .map((word: string) => word.charAt(0))
                        .join("")
                        .toUpperCase();

                      return (
                        <li
                          key={`${member.lecturerId ?? displayEmail}`}
                          className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium leading-none text-foreground">
                              {displayName}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{displayEmail}</span>
                            </p>
                          </div>
                          {onRemoveMember &&
                            council &&
                            member.lecturerId &&
                            member.lecturerId !== null && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setDeleteMemberTarget({
                                    councilId: council.id,
                                    lecturerId: member.lecturerId!,
                                    lecturerName: displayName,
                                  });
                                }}
                                disabled={isRemovingMember}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">
                                  Xóa {displayName} khỏi hội đồng
                                </span>
                              </Button>
                            )}
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              )}
            </section>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              {onEdit &&
              council &&
              council.status?.toLowerCase() !== "inactive" ? (
                <Button type="button" onClick={() => onEdit(council)}>
                  Chỉnh sửa
                </Button>
              ) : null}
            </>
          )}
        </DialogFooter>
      </DialogContent>

      <AlertDialog
        open={deleteMemberTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteMemberTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa giảng viên khỏi hội đồng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              <strong>{deleteMemberTarget?.lecturerName}</strong> khỏi hội đồng
              này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingMember}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteMemberTarget && onRemoveMember) {
                  onRemoveMember(
                    deleteMemberTarget.councilId,
                    deleteMemberTarget.lecturerId
                  );
                  setDeleteMemberTarget(null);
                }
              }}
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
