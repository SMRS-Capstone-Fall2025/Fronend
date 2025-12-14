import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVndCurrency } from "@/lib/utils";
import type { CourseDto } from "@/services/types";
import type { PaginationState } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/ui/table-pagination";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { placeholderImages } from "@/lib/placeholder-images.json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";

const defaultCourseImage =
  placeholderImages.find((item) => item.id === "course-b1")?.imageUrl ??
  "https://images.unsplash.com/photo-1516577409088-9cb17a4327cf?auto=format&fit=crop&w=400&q=80";

type Props = {
  readonly courses: CourseDto[];
  readonly keyword: string;
  readonly isLoading?: boolean;
  readonly isFetching?: boolean;
  readonly onKeywordChange: (value: string) => void;
  readonly pagination: PaginationState;
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly pageSizeOptions?: ReadonlyArray<number>;
};

export default function CourseTable({
  courses,
  keyword,
  isLoading,
  isFetching,
  onKeywordChange,
  pagination,
  onPageSizeChange,
  pageSizeOptions,
}: Props) {
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    startItem,
    endItem,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
  } = pagination;
  const trimmedKeyword = keyword.trim();
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(
    null
  );

  const showLoadingRows = isLoading || (isFetching && courses.length === 0);
  const skeletonRows = useMemo(
    () => Array.from({ length: Math.min(pageSize, 5) }, (_, i) => i),
    [pageSize]
  );

  const closePreview = () => {
    setPreview(null);
  };

  const renderRows = () => {
    if (showLoadingRows) {
      return skeletonRows.map((index) => (
        <TableRow key={`course-loading-${index}`}>
          <TableCell className="w-[110px]">
            <Skeleton className="h-16 w-28 rounded-md" />
          </TableCell>
          <TableCell className="w-[220px]">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </TableCell>
        </TableRow>
      ));
    }

    if (courses.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-12">
            <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <div className="text-lg font-medium">
                {trimmedKeyword
                  ? "Không tìm thấy khóa học phù hợp"
                  : "Chưa có khóa học nào"}
              </div>
              <div>
                {trimmedKeyword
                  ? "Vui lòng thử với từ khóa khác."
                  : 'Nhấn nút "Thêm khóa học" để tạo khóa học mới.'}
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return courses.map((course) => {
      const sectionTitles = course.sections
        .map((section) => section.title?.trim())
        .filter((title): title is string => Boolean(title && title.length > 0));
      const imageSrc = (course.imageUrl ?? "").trim() || defaultCourseImage;
      const imageAlt = course.imageUrl
        ? `Hình ảnh khóa học ${course.name}`
        : "Hình minh họa khóa học";

      return (
        <TableRow key={course.id}>
          <TableCell className="w-[110px]">
            <button
              type="button"
              onClick={() => setPreview({ src: imageSrc, name: course.name })}
              className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-md border bg-muted/40 transition hover:scale-[1.02]"
            >
              <img
                src={imageSrc}
                alt={imageAlt}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = defaultCourseImage;
                }}
              />
            </button>
          </TableCell>
          <TableCell className="font-medium">{course.name}</TableCell>
          <TableCell className="max-w-xs truncate">
            {course.description}
          </TableCell>
          <TableCell>{formatVndCurrency(course.price)}</TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              {sectionTitles.slice(0, 2).map((title) => (
                <Badge key={title} variant="outline" className="text-xs">
                  {title}
                </Badge>
              ))}
              {sectionTitles.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{sectionTitles.length - 2}
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-2 md:max-w-sm">
        <Input
          placeholder="Tìm kiếm khóa học"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Hình ảnh</TableHead>
              <TableHead>Tên khóa học</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tính năng</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderRows()}</TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        isLoading={isLoading}
        isFetching={isFetching}
        onNext={nextPage}
        onPrevious={previousPage}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => !open && closePreview()}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{preview?.name ?? "Xem ảnh khóa học"}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={preview?.src ?? defaultCourseImage}
              alt={preview?.name ?? "Hình minh họa khóa học"}
              className="max-h-[70vh] w-full rounded-md object-contain"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = defaultCourseImage;
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
