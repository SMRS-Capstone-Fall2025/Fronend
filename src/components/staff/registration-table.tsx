import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import type { PaginationState } from "@/hooks/use-pagination";
import {
  getRegistrationStatusLabel,
  registrationStatusLabels,
  type RegistrationSearchItem,
} from "@/services/types";
import { Eye, Loader2 } from "lucide-react";

type Props = {
  readonly registrations: ReadonlyArray<RegistrationSearchItem>;
  readonly keyword: string;
  readonly status?: number;
  readonly isLoading?: boolean;
  readonly isFetching?: boolean;
  readonly pagination: PaginationState;
  readonly onKeywordChange: (value: string) => void;
  readonly onStatusChange: (status: number | undefined) => void;
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly onView?: (registration: RegistrationSearchItem) => void;
};

const REGISTRATION_STATUS_OPTIONS = Object.entries(
  registrationStatusLabels
).map(([value, label]) => ({
  value: Number.parseInt(value, 10),
  label,
}));

const STATUS_BADGE_VARIANTS: Record<number, BadgeProps["variant"]> = {
  0: "secondary",
  1: "outline",
  2: "default",
  3: "destructive",
  4: "outline",
};

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatRegistrationDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return dateTimeFormatter.format(parsed);
};

export default function RegistrationTable({
  registrations,
  keyword,
  status,
  isLoading,
  isFetching,
  pagination,
  onKeywordChange,
  onStatusChange,
  onPageSizeChange,
  onView,
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

  const showLoadingRows =
    isLoading || (isFetching && registrations.length === 0);
  const skeletonRows = useMemo(
    () => Array.from({ length: Math.min(pageSize, 5) }, (_, index) => index),
    [pageSize]
  );
  const trimmedKeyword = keyword.trim();
  const isFiltering = Boolean(trimmedKeyword || status !== undefined);

  const renderRows = () => {
    if (showLoadingRows) {
      return skeletonRows.map((index) => (
        <TableRow key={`registration-loading-${index}`}>
          <TableCell>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-9 w-9" />
          </TableCell>
        </TableRow>
      ));
    }

    if (registrations.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="py-12">
            <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <div className="text-lg font-medium">
                {isFiltering
                  ? "Không tìm thấy đăng ký phù hợp"
                  : "Chưa có đăng ký nào"}
              </div>
              <div>
                {isFiltering
                  ? "Vui lòng thử lại với từ khóa hoặc trạng thái khác."
                  : "Các đăng ký mới sẽ xuất hiện tại đây."}
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return registrations.map((registration) => {
      const statusVariant =
        STATUS_BADGE_VARIANTS[registration.status] ?? "outline";
      const statusLabel = getRegistrationStatusLabel(registration.status);
      const studentName =
        registration.studentName?.trim() ||
        registration.fullName?.trim() ||
        "—";
      const email =
        registration.studentEmail?.trim() || registration.email?.trim() || "—";
      const phone = registration.phoneNumber?.trim() || "—";
      const cccd = registration.cccd?.trim();
      const note = registration.note?.trim();
      const courseName = registration.courseName?.trim() || "—";

      return (
        <TableRow key={registration.id}>
          <TableCell>
            <div className="space-y-1">
              <div className="font-medium">{studentName}</div>
              {email !== "—" && (
                <div className="text-sm text-muted-foreground">{email}</div>
              )}
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>{phone}</div>
              {cccd && <div>CCCD: {cccd}</div>}
            </div>
          </TableCell>
          <TableCell className="font-medium">{courseName}</TableCell>
          <TableCell>
            {formatRegistrationDate(registration.registerDate)}
          </TableCell>
          <TableCell>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </TableCell>
          <TableCell className="max-w-xs truncate" title={note || undefined}>
            {note || "—"}
          </TableCell>
          <TableCell className="text-right">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onView?.(registration)}
              disabled={!onView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 md:max-w-sm">
          <Input
            placeholder="Tìm kiếm theo tên, email hoặc CMND"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
          {isFetching && !isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Select
            value={status === undefined ? "all" : String(status)}
            onValueChange={(value) => {
              if (value === "all") {
                onStatusChange(undefined);
                return;
              }
              const parsed = Number.parseInt(value, 10);
              onStatusChange(Number.isNaN(parsed) ? undefined : parsed);
            }}
            disabled={isLoading && registrations.length === 0}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {REGISTRATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học viên</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ghi chú</TableHead>
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
      />
    </div>
  );
}
