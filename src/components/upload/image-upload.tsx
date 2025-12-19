import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUploadImageMutation } from "@/services";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2, UploadCloud } from "lucide-react";

export type ImageUploadProps = {
  readonly label?: string;
  readonly description?: string;
  readonly value?: string | null;
  readonly onChange?: (url: string | null) => void;
  readonly onUploadSuccess?: (url: string) => void | Promise<void>;
  readonly accept?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly fallbackName?: string | null;
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) {
    return words[0]!.charAt(0).toUpperCase();
  }
  return (words[0]!.charAt(0) + words[words.length - 1]!.charAt(0))
    .toUpperCase()
    .slice(0, 2);
};

export function ImageUpload({
  label,
  description,
  value,
  onChange,
  onUploadSuccess,
  accept = "image/*",
  disabled,
  className,
  fallbackName,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const { mutateAsync: uploadImage, isPending } = useUploadImageMutation();

  useEffect(() => {
    return () => {
      if (tempPreview) {
        URL.revokeObjectURL(tempPreview);
      }
    };
  }, [tempPreview]);

  const previewUrl = useMemo(() => {
    if (isPending && tempPreview) {
      return tempPreview;
    }
    return value ?? null;
  }, [tempPreview, value, isPending]);

  useEffect(() => {
    // Reset image error when value changes
    setImageError(false);
  }, [value]);

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tệp không hợp lệ",
        description: "Vui lòng chọn định dạng hình ảnh hợp lệ.",
        variant: "destructive",
      });
      resetInput();
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setTempPreview(objectUrl);

    try {
      const response = await uploadImage({ file });
      const data = response.data;
      const uploadedUrl =
        typeof data === "string" ? data : data?.url ?? data?.path ?? null;

      if (!uploadedUrl) {
        throw new Error("Hệ thống không trả về đường dẫn hình ảnh.");
      }

      onChange?.(uploadedUrl);

      if (onUploadSuccess) {
        await onUploadSuccess(uploadedUrl);
      }

      setTempPreview(null);
      URL.revokeObjectURL(objectUrl);

      toast({
        title: "Tải ảnh thành công",
        description: "Hình ảnh đã được tải lên và cập nhật.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải ảnh lên. Vui lòng thử lại.";
      toast({
        title: "Tải ảnh thất bại",
        description: message,
        variant: "destructive",
      });
      setTempPreview(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      resetInput();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(label || description) && (
        <div className="space-y-1">
          {label && <p className="text-sm font-medium leading-none">{label}</p>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border border-dashed border-muted-foreground/40 bg-muted/40">
          {previewUrl && !imageError ? (
            <img
              src={previewUrl}
              alt="Xem trước ảnh"
              className="h-full w-full object-cover"
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              {fallbackName ? (
                <span className="text-2xl font-semibold text-primary">
                  {getInitials(fallbackName)}
                </span>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-xs">Chưa có ảnh</span>
                </div>
              )}
            </div>
          )}

          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isPending}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectClick}
            disabled={disabled || isPending}
            className="w-fit"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Chọn ảnh
          </Button>
        </div>
      </div>
    </div>
  );
}
