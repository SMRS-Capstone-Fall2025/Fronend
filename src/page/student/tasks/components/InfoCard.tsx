import type { LucideIcon } from "lucide-react";

type InfoCardProps = {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
  readonly helper?: string | null;
};

export function InfoCard({ icon: Icon, label, value, helper }: InfoCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
      {helper ? (
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

