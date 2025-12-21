import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUploadImageMutation } from "@/services";
import { cn } from "@/lib/utils";
import { Camera, Loader2, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

export interface AvatarUploaderProps {
  readonly value?: string | null;
  readonly fallback: string;
  readonly disabled?: boolean;
  readonly onChange?: (url: string | null) => void;
  readonly className?: string;
}

export function AvatarUploader({
  value,
  fallback,
  disabled = false,
  onChange,
  className,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const { mutateAsync: uploadImage, isPending } = useUploadImageMutation();

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (disabled || isPending) {
      return;
    }
    setTempPreview(null);
    onChange?.(null);
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
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setTempPreview(objectUrl);

    try {
      const response = await uploadImage({ file });
      const uploadedUrl = response.data?.url ?? null;

      if (!uploadedUrl) {
        throw new Error("Hệ thống không trả về đường dẫn hình ảnh.");
      }

      onChange?.(uploadedUrl);
      setTempPreview(null);
      URL.revokeObjectURL(objectUrl);
      toast({
        title: "Tải ảnh thành công",
        description: "Hình ảnh đã được cập nhật.",
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const previewUrl = tempPreview ?? value ?? null;

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
        <AvatarImage src={previewUrl ?? undefined} alt="Avatar" />
        <AvatarFallback className="text-xl font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {!disabled && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isPending}
          />
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleSelectClick}
              disabled={disabled || isPending}
            >
              <Camera className="h-4 w-4" />
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleClear}
                disabled={disabled || isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
