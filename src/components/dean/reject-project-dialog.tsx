import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProjectListItemDto } from "@/services/types";
import { useState, useEffect } from "react";

type RejectProjectDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly project: ProjectListItemDto | null;
  readonly onReject: (data: {
    readonly rejectType: "REVISION" | "PERMANENT";
    readonly reason?: string | null;
    readonly feedback?: string | null;
    readonly revisionDays?: number | null;
  }) => Promise<void>;
  readonly isProcessing?: boolean;
};

export function RejectProjectDialog({
  open,
  onOpenChange,
  project,
  onReject,
  isProcessing = false,
}: RejectProjectDialogProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [rejectType, setRejectType] = useState<"REVISION" | "PERMANENT">(
    "REVISION"
  );
  const [revisionDays, setRevisionDays] = useState<string>("7");

  useEffect(() => {
    if (!open) {
      setRejectReason("");
      setRejectFeedback("");
      setRejectType("REVISION");
      setRevisionDays("7");
    }
  }, [open]);

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!project?.id) {
      return;
    }

    const revisionDaysNum = Number.parseInt(revisionDays, 10);
    if (
      rejectType === "REVISION" &&
      (!revisionDays || isNaN(revisionDaysNum) || revisionDaysNum < 1)
    ) {
      return;
    }

    try {
      await onReject({
        rejectType: rejectType,
        reason: rejectReason.trim() || undefined,
        feedback: rejectFeedback.trim() || undefined,
        revisionDays: rejectType === "REVISION" ? revisionDaysNum : undefined,
      });
      // Dialog sẽ được đóng trong onSuccess của mutation ở parent component
    } catch (error) {
      // Error đã được xử lý trong parent component
      console.error(error);
    }
  };

  const revisionDaysNum = Number.parseInt(revisionDays, 10);
  const isSubmitDisabled =
    isProcessing ||
    (rejectType === "REVISION" &&
      (!revisionDays || isNaN(revisionDaysNum) || revisionDaysNum < 1));

  const handleOpenChange = (newOpen: boolean) => {
    // Chỉ cho phép đóng dialog nếu không đang xử lý
    if (!newOpen && !isProcessing) {
      onOpenChange(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận từ chối dự án</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn sắp từ chối {project?.name ?? "dự án này"}. Vui lòng chọn loại
            từ chối và có thể kèm theo ghi chú.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Loại từ chối <span className="text-destructive">*</span>
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={rejectType === "REVISION" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRejectType("REVISION")}
              >
                Cần sửa lại
              </Button>
              <Button
                type="button"
                variant={rejectType === "PERMANENT" ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => setRejectType("PERMANENT")}
              >
                Từ chối
              </Button>
            </div>
            {rejectType === "REVISION" && (
              <p className="text-xs text-muted-foreground">
                Dự án sẽ được yêu cầu sửa lại và có thể nộp lại sau.
              </p>
            )}
            {rejectType === "PERMANENT" && (
              <p className="text-xs text-muted-foreground">
                Dự án sẽ bị từ chối.
              </p>
            )}
          </div>
          {rejectType === "REVISION" && (
            <div className="space-y-2">
              <Label htmlFor="revision-days">
                Số ngày để sửa lại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="revision-days"
                type="number"
                min="1"
                value={revisionDays}
                onChange={(event) => setRevisionDays(event.target.value)}
                placeholder="Nhập số ngày"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Lý do (tuỳ chọn)</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Nhập lý do từ chối"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reject-feedback">Phản hồi (tuỳ chọn)</Label>
            <Textarea
              id="reject-feedback"
              value={rejectFeedback}
              onChange={(event) => setRejectFeedback(event.target.value)}
              placeholder="Nhập phản hồi chi tiết"
              rows={3}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={cn(
              rejectType === "PERMANENT" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
            )}
          >
            {isProcessing
              ? "Đang gửi..."
              : rejectType === "PERMANENT"
              ? "Từ chối"
              : "Yêu cầu sửa lại"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
