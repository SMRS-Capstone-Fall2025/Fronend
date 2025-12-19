import type React from "react";
import { Button } from "@/components/ui/button";

interface UploadDropzoneProps {
  id?: string;
  disabled?: boolean;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadDropzone({
  id = "upload",
  disabled = false,
  accept = "image/*,application/pdf",
  onChange,
}: UploadDropzoneProps) {
  return (
    <label
      htmlFor={id}
      className="group relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
    >
      <div className="flex flex-col items-center">
        <svg
          className="h-10 w-10 text-muted-foreground group-hover:text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16v-4a4 4 0 014-4h2a4 4 0 014 4v4m-6 0v4m0-4H7m6 0h6"
          />
        </svg>
        <div className="text-sm font-medium text-foreground">
          Kéo thả tệp vào đây hoặc nhấp để chọn
        </div>
        <div className="text-xs text-muted-foreground">
          (jpg, png, pdf — tối đa 5MB)
        </div>
      </div>

      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="mt-2 sm:mt-0">
        <Button variant="ghost" size="sm" type="button" disabled={disabled}>
          Chọn tệp
        </Button>
      </div>
    </label>
  );
}
