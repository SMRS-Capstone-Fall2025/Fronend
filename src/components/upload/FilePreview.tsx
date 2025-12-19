import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  file: File;
  preview?: string | null;
  onRemove: () => void;
}

export default function FilePreview({
  file,
  preview,
  onRemove,
}: FilePreviewProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div className="flex items-center gap-3">
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="h-16 w-24 object-cover rounded-md"
          />
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-md bg-muted/10 text-sm text-muted-foreground">
            PDF
          </div>
        )}
        <div>
          <div className="font-medium">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          type="button"
          onClick={onRemove}
        >
          Xóa
        </Button>
      </div>
    </div>
  );
}
