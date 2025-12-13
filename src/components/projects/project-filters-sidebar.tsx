import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ProjectStatusApi } from "@/services/types/project";
import { Filter, Search, X } from "lucide-react";
import { useState } from "react";

interface SpecializationOption {
  value: string;
  label: string;
}

interface ProjectFiltersSidebarProps {
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  statusFilter: "" | ProjectStatusApi;
  onStatusFilterChange: (value: "" | ProjectStatusApi) => void;
  specializationFilter: string;
  onSpecializationFilterChange: (value: string) => void;
  specializationOptions: SpecializationOption[];
  statusOptions: Array<{ value: ProjectStatusApi; label: string }>;
  className?: string;
}

const SPECIALIZATION_FILTER_ALL_VALUE = "all";
const SPECIALIZATION_FILTER_UNKNOWN_VALUE = "__unknown__";

export function ProjectFiltersSidebar({
  nameFilter,
  onNameFilterChange,
  statusFilter,
  onStatusFilterChange,
  specializationFilter,
  onSpecializationFilterChange,
  specializationOptions,
  statusOptions,
  className,
}: ProjectFiltersSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filtersActive = Boolean(
    nameFilter.trim() || statusFilter || specializationFilter
  );

  const clearFilters = () => {
    onNameFilterChange("");
    onStatusFilterChange("");
    onSpecializationFilterChange("");
  };

  const statusSelectValue = statusFilter || "all";
  const specializationFilterValue =
    specializationFilter || SPECIALIZATION_FILTER_ALL_VALUE;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("gap-2 lg:hidden", className)}
      >
        <Filter className="h-4 w-4" />
        <span>Bộ lọc</span>
        {filtersActive && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            !
          </span>
        )}
      </Button>

      <aside
        className={cn(
          "hidden lg:flex lg:w-72 lg:flex-col lg:border lg:border-border lg:bg-muted/30 rounded-xl shadow-sm",
          "lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-6rem)]",
          className
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Bộ lọc</h3>
            </div>
            {filtersActive && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={clearFilters}
              >
                Xóa
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={nameFilter}
                    onChange={(e) => onNameFilterChange(e.target.value)}
                    placeholder="Nhập từ khóa..."
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={statusSelectValue}
                  onValueChange={(value) =>
                    onStatusFilterChange(
                      value === "all" ? "" : (value as ProjectStatusApi)
                    )
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Chuyên ngành</label>
                <Select
                  value={specializationFilterValue}
                  onValueChange={(value) => {
                    if (value === SPECIALIZATION_FILTER_ALL_VALUE) {
                      onSpecializationFilterChange("");
                      return;
                    }
                    onSpecializationFilterChange(value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tất cả chuyên ngành" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SPECIALIZATION_FILTER_ALL_VALUE}>
                      Tất cả chuyên ngành
                    </SelectItem>
                    <SelectItem value={SPECIALIZATION_FILTER_UNKNOWN_VALUE}>
                      Chưa cập nhật
                    </SelectItem>
                    {specializationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-80 border-l border-border bg-background shadow-xl lg:hidden">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Bộ lọc</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-6 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tìm kiếm</label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={nameFilter}
                        onChange={(e) => onNameFilterChange(e.target.value)}
                        placeholder="Nhập từ khóa..."
                        className="h-10 pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select
                      value={statusSelectValue}
                      onValueChange={(value) =>
                        onStatusFilterChange(
                          value === "all" ? "" : (value as ProjectStatusApi)
                        )
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chuyên ngành</label>
                    <Select
                      value={specializationFilterValue}
                      onValueChange={(value) => {
                        if (value === SPECIALIZATION_FILTER_ALL_VALUE) {
                          onSpecializationFilterChange("");
                          return;
                        }
                        onSpecializationFilterChange(value);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tất cả chuyên ngành" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SPECIALIZATION_FILTER_ALL_VALUE}>
                          Tất cả chuyên ngành
                        </SelectItem>
                        <SelectItem value={SPECIALIZATION_FILTER_UNKNOWN_VALUE}>
                          Chưa cập nhật
                        </SelectItem>
                        {specializationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ScrollArea>

              <div className="border-t border-border p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                  disabled={!filtersActive}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
