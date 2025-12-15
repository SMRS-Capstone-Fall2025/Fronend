import { ChangeEvent, FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImportProjectsMutation } from "@/services/project/hooks";
import { useToast } from "@/hooks/use-toast";

interface ImportProjectDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
}

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export function ImportProjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportProjectDialogProps) {
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importInputKey, setImportInputKey] = useState(0);
  const importProjectsMutation = useImportProjectsMutation();
  const isImporting = importProjectsMutation.isPending;

  const resetImportState = () => {
    setImportFile(null);
    setImportInputKey((value) => value + 1);
  };

  const closeImportDialog = () => {
    onOpenChange(false);
    resetImportState();
  };

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImportFile(null);
      return;
    }

    const allowedExtensions = ["csv", "xlsx", "xls"];
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.includes(extension)) {
      toast({
        variant: "destructive",
        title: "Định dạng tệp không hợp lệ",
        description: "Chỉ hỗ trợ các tệp .csv, .xls hoặc .xlsx.",
      });
      event.target.value = "";
      setImportFile(null);
      return;
    }

    setImportFile(file);
  };

  const handleImportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!importFile) {
      toast({
        variant: "destructive",
        title: "Chưa chọn tệp",
        description: "Vui lòng chọn một tệp danh sách dự án để tiếp tục.",
      });
      return;
    }

    try {
      await importProjectsMutation.mutateAsync({ file: importFile });
      toast({
        title: "Đã nhập danh sách dự án",
        description:
          "Hệ thống sẽ xử lý dữ liệu và cập nhật bảng dự án trong giây lát.",
      });
      closeImportDialog();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể nhập danh sách",
        description:
          error instanceof Error
            ? error.message
            : "Vui lòng kiểm tra lại tệp và thử lại.",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetImportState();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import danh sách dự án</DialogTitle>
          <DialogDescription>
            Tải lên tệp Excel hoặc CSV theo định dạng mẫu để thêm hàng loạt dự
            án.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Tệp danh sách
            </Label>
            <Input
              key={importInputKey}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleImportFileChange}
              disabled={isImporting}
            />
            <p className="text-xs text-muted-foreground">
              Hỗ trợ .csv, .xls, .xlsx (tối đa ~5MB). Hãy dùng mẫu với các cột
              cơ bản: Tên dự án, Loại, Hạn chót, Mô tả, Trưởng nhóm.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm">
            {importFile ? (
              <div>
                <p className="font-medium text-foreground">{importFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(importFile.size)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Chưa có tệp được chọn. Vui lòng chọn tệp trước khi nhập.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeImportDialog}
              disabled={isImporting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isImporting || !importFile || importFile === null}
            >
              {isImporting ? "Đang nhập..." : "Nhập danh sách"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
