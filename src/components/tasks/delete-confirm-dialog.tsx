import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TaskDto } from "@/services/types/task";

type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskDto | null | undefined;
  onConfirm: () => void;
  isDeleting: boolean;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  task,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Hành động này sẽ xóa công việc "{task?.name}" vĩnh viễn. Bạn có
            chắc chắn muốn tiếp tục?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

