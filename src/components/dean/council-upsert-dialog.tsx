import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CouncilFormValues } from "./council-form";
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
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Tạo hội đồng mới" : "Chỉnh sửa hội đồng"}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <CouncilForm
            mode={mode}
            initialValues={initialValues}
            submitting={submitting}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            onDelete={mode === "edit" ? onDelete : undefined}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
