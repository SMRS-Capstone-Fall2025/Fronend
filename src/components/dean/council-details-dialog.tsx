import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CouncilDto } from "@/services/types";
import { Mail } from "lucide-react";

function councilStatusPresentation(status?: string | null): {
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
        className: "border-slate-300 bg-slate-100 text-slate-700",
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
        variant: "default",
      };
    case "inactive":
      return {
        label: "Tạm dừng",
        variant: "secondary",
      };
    case "archived":
      return {
        label: "Lưu trữ",
        variant: "outline",
        className: "border-purple-200 bg-purple-100 text-purple-700",
      };
    default:
      return {
        label: status ?? "Chưa xác định",
        variant: "outline",
      };
  }
}

export interface CouncilDetailsDialogProps {
  readonly council?: CouncilDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onEdit?: (council: CouncilDto) => void;
}

export function CouncilDetailsDialog({
  council,
  open,
  onOpenChange,
  onEdit,
}: CouncilDetailsDialogProps) {
  const members = council?.members ?? [];
  const statusChip = councilStatusPresentation(council?.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-6 sm:max-w-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle>
            {council?.councilName ?? "Chi tiết hội đồng"}
          </DialogTitle>
          <DialogDescription>
            {council?.department ? `Khoa ${council.department}` : ""}
          </DialogDescription>
        </DialogHeader>

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
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </section>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          {onEdit && council ? (
            <Button type="button" onClick={() => onEdit(council)}>
              Chỉnh sửa
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
