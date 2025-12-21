import type { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number | null | undefined;
  helper?: string;
}

export function InfoCard({ icon: Icon, label, value, helper }: InfoCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          {value ?? "N/A"}
        </p>
        {helper && (
          <p className="text-[10px] text-muted-foreground">{helper}</p>
        )}
      </div>
    </div>
  );
}

