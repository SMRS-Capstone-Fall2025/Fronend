import { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
  ];

  return (
    <>
      <style>{`
        .rich-text-editor-wrapper .ql-container {
          min-height: 320px;
          font-size: 15px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border: 2px solid hsl(var(--border) / 0.6) !important;
          border-top: none !important;
          background: hsl(var(--background) / 0.5);
        }

        .rich-text-editor-wrapper .ql-container.ql-snow {
          border: 2px solid hsl(var(--border) / 0.6) !important;
          border-top: none !important;
        }

        .rich-text-editor-wrapper .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border: 2px solid hsl(var(--border) / 0.6) !important;
          border-bottom: none !important;
          background: hsl(var(--background) / 0.8);
        }

        .rich-text-editor-wrapper .ql-toolbar.ql-snow {
          border: 2px solid hsl(var(--border) / 0.6) !important;
          border-bottom: none !important;
        }

        .rich-text-editor-wrapper .ql-editor {
          min-height: 320px;
          color: hsl(var(--foreground));
        }

        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }

        .rich-text-editor-wrapper .ql-stroke {
          stroke: hsl(var(--foreground) / 0.7);
        }

        .rich-text-editor-wrapper .ql-fill {
          fill: hsl(var(--foreground) / 0.7);
        }

        .rich-text-editor-wrapper .ql-picker-label {
          color: hsl(var(--foreground) / 0.7);
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button:focus,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button:focus .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--primary));
        }

        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button:focus .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: hsl(var(--primary));
        }

        .rich-text-editor-wrapper .ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
          color: hsl(var(--primary));
        }

        .rich-text-editor-wrapper:focus-within .ql-container,
        .rich-text-editor-wrapper:focus-within .ql-toolbar {
          border-color: hsl(var(--primary)) !important;
        }

        .rich-text-editor-wrapper:hover .ql-container,
        .rich-text-editor-wrapper:hover .ql-toolbar {
          border-color: hsl(var(--primary) / 0.4) !important;
        }
      `}</style>
      <div className={cn("rich-text-editor-wrapper", className)}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          className="bg-background"
        />
      </div>
    </>
  );
}

