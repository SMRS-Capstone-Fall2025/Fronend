import { Skeleton } from "@/components/ui/skeleton";

export function TaskDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-[110px] rounded-xl" />
        <Skeleton className="h-[110px] rounded-xl" />
        <Skeleton className="h-[110px] rounded-xl" />
      </div>
      <Skeleton className="h-[120px] rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-[100px] rounded-xl" />
    </div>
  );
}

