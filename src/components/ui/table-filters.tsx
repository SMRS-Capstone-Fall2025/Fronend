import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";

export interface TableFilterOption {
  readonly value: string;
  readonly label: string;
}

export interface TableFilterConfig {
  readonly id: string;
  readonly type: "search" | "select" | "date";
  readonly placeholder?: string;
  readonly label?: string;
  readonly options?: readonly TableFilterOption[];
  readonly className?: string;
}

export interface TableFiltersProps {
  readonly filters: readonly TableFilterConfig[];
  readonly values: Record<string, string>;
  readonly onChange: (filterId: string, value: string) => void;
  readonly isLoading?: boolean;
  readonly isFetching?: boolean;
}

export function TableFilters({
  filters,
  values,
  onChange,
  isLoading = false,
  isFetching = false,
}: TableFiltersProps) {
  const searchFilters = filters.filter((f) => f.type === "search");
  const otherFilters = filters.filter((f) => f.type !== "search");

  return (
    <div className="flex flex-col gap-4">
      {searchFilters.length > 0 && (
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
          {searchFilters.map((filter, index) => (
            <div
              key={filter.id}
              className={cn(
                "relative",
                index === 0 ? "flex-1 min-w-[220px]" : "w-full md:w-[240px]",
                filter.className
              )}
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={filter.placeholder || "Tìm kiếm..."}
                value={values[filter.id] || ""}
                onChange={(e) => onChange(filter.id, e.target.value)}
                className={cn("pl-10", filter.className)}
              />
              {isFetching && !isLoading && index === 0 && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      )}

      {otherFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {otherFilters.map((filter) => {
            if (filter.type === "select") {
              return (
                <div key={filter.id} className="flex items-center gap-2">
                  {filter.label && (
                    <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {filter.label}:
                    </label>
                  )}
                  <Select
                    value={values[filter.id] || ""}
                    onValueChange={(value) => onChange(filter.id, value)}
                    disabled={isLoading || isFetching}
                  >
                    <SelectTrigger
                      className={cn("w-[180px]", filter.className)}
                    >
                      <SelectValue
                        placeholder={filter.placeholder || "Chọn..."}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.filter((option) => option.value !== "").map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
