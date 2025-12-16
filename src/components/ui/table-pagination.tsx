import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export type TablePaginationProps = {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly startItem: number;
  readonly endItem: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly isLoading?: boolean;
  readonly isFetching?: boolean;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onPageChange?: (page: number) => void;
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly pageSizeOptions?: ReadonlyArray<number>;
};

export function TablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  startItem,
  endItem,
  hasNext,
  hasPrevious,
  isLoading,
  isFetching,
  onPrevious,
  onNext,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
}: TablePaginationProps) {
  const isBusy = Boolean(isLoading || isFetching);
  const options = pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const normalizedOptions = options.includes(pageSize)
    ? options
    : [...options, pageSize].sort((a, b) => a - b);

  const handlePageSizeChange = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      onPageSizeChange?.(parsed);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <div>
        {totalItems > 0 ? (
          <span>
            Hiển thị {startItem}-{endItem} trên tổng {totalItems} mục
          </span>
        ) : (
          <span>Chưa có dữ liệu để hiển thị</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Hiển thị</span>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
              disabled={isBusy}
            >
              <SelectTrigger className="w-[90px]">
                <SelectValue placeholder="Số dòng" />
              </SelectTrigger>
              <SelectContent>
                {normalizedOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(1)}
              disabled={!hasPrevious || isBusy}
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious || isBusy}
            >
              Trước
            </Button>

            <div className="flex items-center gap-1 px-2">
              {(() => {
                const createButton = (p: number) => (
                  <button
                    key={p}
                    onClick={() => onPageChange?.(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      p === page
                        ? "bg-blue-500 text-white"
                        : "text-muted-foreground"
                    }`}
                    disabled={isBusy || p === page}
                  >
                    {p}
                  </button>
                );

                const pages: Array<number | "ellipsis"> = [];

                if (totalPages <= 7) {
                  for (let p = 1; p <= totalPages; p += 1) {
                    pages.push(p);
                  }
                } else {
                  pages.push(1);

                  let left = Math.max(2, page - 1);
                  let right = Math.min(totalPages - 1, page + 1);

                  if (page <= 3) {
                    left = 2;
                    right = Math.min(totalPages - 1, 4);
                  }

                  if (page >= totalPages - 2) {
                    left = Math.max(2, totalPages - 4);
                    right = totalPages - 1;
                  }

                  if (left > 2) {
                    pages.push("ellipsis");
                  }

                  for (let p = left; p <= right; p += 1) {
                    pages.push(p);
                  }

                  if (right < totalPages - 1) {
                    pages.push("ellipsis");
                  }

                  pages.push(totalPages);
                }

                return pages.map((entry, index) => {
                  if (entry === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }

                  return createButton(entry);
                });
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext || isBusy}
            >
              Sau
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(totalPages)}
              disabled={!hasNext || isBusy}
            >
              »
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
