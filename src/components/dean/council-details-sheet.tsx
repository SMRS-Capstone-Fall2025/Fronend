import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CouncilDto } from "@/services/types";
import { Mail } from "lucide-react";

export interface CouncilDetailsSheetProps {
  readonly council?: CouncilDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onEdit?: (council: CouncilDto) => void;
}

export function CouncilDetailsSheet({
  council,
  open,
  onOpenChange,
  onEdit,
}: CouncilDetailsSheetProps) {
  const members = council?.members ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-xl">
        <SheetHeader className="space-y-1">
          <SheetTitle>{council?.councilName ?? "Chi tiết hội đồng"}</SheetTitle>
          <SheetDescription>
            {council?.department ? `Khoa ${council.department}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
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
            <p className="mt-1 text-sm font-medium text-foreground capitalize">
              {council?.status ?? "Chưa xác định"}
            </p>
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
              <ul className="mt-3 space-y-3">
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
                      className="flex items-center gap-3"
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
            )}
          </section>
        </div>

        <SheetFooter className="mt-8 gap-2 sm:flex-row">
          {onEdit && council ? (
            <Button
              type="button"
              variant="default"
              onClick={() => onEdit(council)}
            >
              Chỉnh sửa
            </Button>
          ) : null}
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
