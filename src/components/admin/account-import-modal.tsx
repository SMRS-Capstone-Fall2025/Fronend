import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useImportAccountsMutation } from "@/services/account";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AccountImportModal({ open, onOpenChange }: Props) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const { toast } = useToast();
  const importMutation = useImportAccountsMutation({
    onSuccess: (data) => {
      const importedCount = data?.importedCount ?? null;
      toast({
        title: "Import hoàn tất",
        description: importedCount
          ? `Đã import ${importedCount} tài khoản.`
          : "Tệp đã được tải lên. Kiểm tra kết quả trên server.",
        variant: "success",
      });
      setSelectedFile(null);
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "Lỗi khi import",
        description:
          err?.response?.data?.message ??
          err?.message ??
          "Không thể import file.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    const form = new FormData();
    form.append("file", selectedFile, selectedFile.name);

    try {
      setIsImporting(true);
      await importMutation.mutateAsync({ file: selectedFile });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import danh sách tài khoản</DialogTitle>
          <DialogDescription>
            Tải lên file CSV/Excel chứa danh sách tài khoản.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label>File (CSV / Excel)</Label>
          </div>

          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="w-full"
          />

          {selectedFile && (
            <p className="text-sm text-muted-foreground mt-2">
              Chosen file: {selectedFile.name}
            </p>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? "Đang import..." : "Import"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
