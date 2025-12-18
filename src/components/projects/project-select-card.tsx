import {
  ProjectSelect,
  type ProjectSelectOption,
} from "@/components/project-select";
import type { LucideIcon } from "lucide-react";
import type { Ref } from "react";

export interface ProjectSelectCardProps {
  readonly selectedProjectId: string;
  readonly onValueChange: (value: string) => void;
  readonly onProjectChange?: (project: ProjectSelectOption | null) => void;
  readonly selectedProject?: ProjectSelectOption | null;
  readonly title?: string;
  readonly description?: string;
  readonly placeholder?: string;
  readonly icon?: LucideIcon;
  readonly actionButtons?: React.ReactNode;
  readonly triggerRef?: Ref<HTMLButtonElement>;
  readonly triggerClassName?: string;
}

export function ProjectSelectCard({
  selectedProjectId,
  onValueChange,
  onProjectChange,
  title = "Chọn bảng dự án",
  placeholder = "Chọn dự án",
  actionButtons,
  triggerRef,
  triggerClassName,
}: ProjectSelectCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-6 shadow-lg">
      {/* Background blur effects */}
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-blue-500/20 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-400/15 blur-[140px]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1 space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{title}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <ProjectSelect
                value={selectedProjectId}
                onValueChange={onValueChange}
                onProjectChange={onProjectChange}
                triggerRef={triggerRef}
                placeholder={placeholder}
                triggerClassName={
                  triggerClassName ||
                  "h-11 text-base border-2 border-white/60 bg-white/90 backdrop-blur-sm shadow-md hover:border-blue-300/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all rounded-lg"
                }
              />
            </div>
          </div>
        </div>

        {actionButtons && (
          <div className="flex items-center gap-3 lg:flex-shrink-0">
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
}
