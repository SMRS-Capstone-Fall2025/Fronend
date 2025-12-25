import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useImportAccountsMutation } from "@/services/account";
import { accountQueryKeys } from "@/services/account/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Upload,
  X,
} from "lucide-react";
import React from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AccountImportModal({ open, onOpenChange }: Props) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importMutation = useImportAccountsMutation({
    onSuccess: async (data) => {
      const importedCount =
        (data as { importedCount?: number })?.importedCount ?? null;

      await queryClient.invalidateQueries({ queryKey: accountQueryKeys.all });

      toast({
        title: "Import hoàn tất",
        description: importedCount
          ? `Đã import thành công ${importedCount} tài khoản.`
          : "Tệp đã được tải lên. Kiểm tra kết quả trên server.",
        variant: "success",
      });
      setSelectedFile(null);
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ??
        (err as { message?: string })?.message ??
        "Không thể import file.";
      toast({
        title: "Lỗi khi import",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Định dạng file không hợp lệ",
        description: "Vui lòng chọn file CSV hoặc Excel (.csv, .xlsx, .xls)",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File quá lớn",
        description: "Kích thước file không được vượt quá 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      await importMutation.mutateAsync({ file: selectedFile });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.xlsx";
    link.download = "template.xlsx";
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImporting = importMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isImporting) {
          onOpenChange(open);
          if (!open) {
            setSelectedFile(null);
            setIsDragging(false);
          }
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import danh sách người dùng
          </DialogTitle>
          <DialogDescription>
            Tải lên file CSV/Excel chứa danh sách tài khoản để import vào hệ
            thống
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">
                  Định dạng file yêu cầu
                </Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Tải template
              </Button>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>File CSV hoặc Excel (.csv, .xlsx, .xls)</li>
              <li>Kích thước tối đa: 10MB</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Chọn file để import</Label>
            <div
              className={cn(
                "rounded-lg border-2 border-dashed transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                selectedFile && "border-emerald-500 bg-emerald-50/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center gap-4 px-6 py-12 cursor-pointer">
                  <div
                    className={cn(
                      "rounded-full p-4 transition-colors",
                      isDragging ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <Upload
                      className={cn(
                        "h-8 w-8 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      {isDragging
                        ? "Thả file vào đây"
                        : "Kéo thả file vào đây hoặc nhấp để chọn"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Hỗ trợ: CSV, XLSX, XLS (tối đa 10MB)
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="rounded-lg bg-emerald-100 p-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isImporting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Alert variant="default" className="border-amber-200 bg-amber-50/50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <p className="font-medium mb-1">Lưu ý quan trọng</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>
                  Email phải là duy nhất trong hệ thống. Nếu email đã tồn tại,
                  tài khoản sẽ được bỏ qua.
                </li>
                <li>
                  Vui lòng kiểm tra kỹ thông tin trước khi import để tránh sai
                  sót.
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
            className="gap-2"
          >
            {isImporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang import...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
