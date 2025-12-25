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
import { CouncilFormValues } from "@/lib/validations/council";
import { Loader2 } from "lucide-react";
import { CouncilForm } from "./council-form";

export interface CouncilUpsertDialogProps {
  readonly open: boolean;
  readonly mode: "create" | "edit";
  readonly initialValues?: Partial<CouncilFormValues>;
  readonly submitting?: boolean;
  readonly onSubmit: (values: CouncilFormValues) => Promise<void> | void;
  readonly onOpenChange: (open: boolean) => void;
  readonly onDelete?: () => void;
}

export function CouncilUpsertDialog({
  open,
  mode,
  initialValues,
  submitting,
  onSubmit,
  onOpenChange,
  onDelete,
}: CouncilUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border border-border/60 bg-background p-0 shadow-2xl flex flex-col">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-b border-blue-600/20 px-6 py-6 text-left sm:px-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          <DialogHeader className="relative">
            <DialogTitle className="text-white text-xl font-semibold">
              {mode === "create" ? "Tạo hội đồng mới" : "Chỉnh sửa hội đồng"}
            </DialogTitle>
            <DialogDescription className="text-blue-100/90 mt-2">
              {mode === "create"
                ? "Điền thông tin để tạo hội đồng mới và thêm thành viên"
                : "Cập nhật thông tin hội đồng và quản lý thành viên"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-6">
            <CouncilForm
              mode={mode}
              initialValues={initialValues}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          </div>
        </ScrollArea>

        <DialogFooter className="sticky bottom-0 bg-background border-t border-border/50 px-6 py-4 sm:px-10">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={onDelete}
                disabled={submitting}
              >
                Xóa hội đồng
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="council-form"
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Tạo hội đồng" : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
