import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import type { PaginationState } from "@/hooks/use-pagination";
import { Loader2, Pencil } from "lucide-react";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VehicleDto, VehicleStatus } from "@/services/types";
import { vehicleStatusLabels } from "./car-form";

const statusVariantMap: Record<VehicleStatus, BadgeProps["variant"]> = {
  Active: "default",
  Maintenance: "secondary",
  Inactive: "outline",
};

type CarTableProps = {
  readonly vehicles: VehicleDto[];
  readonly keyword: string;
  readonly isLoading?: boolean;
  readonly isFetching?: boolean;
  readonly pagination: PaginationState;
  readonly pageSizeOptions?: ReadonlyArray<number>;
  readonly onKeywordChange: (value: string) => void;
  readonly onEdit?: (vehicle: VehicleDto) => void;
  readonly onPageSizeChange?: (pageSize: number) => void;
};

export default function CarTable({
  vehicles,
  keyword,
  isLoading,
  isFetching,
  pagination,
  pageSizeOptions,
  onKeywordChange,
  onEdit,
  onPageSizeChange,
}: CarTableProps) {
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

  const skeletonRows = useMemo(
    () => Array.from({ length: Math.min(pageSize, 5) }, (_, index) => index),
    [pageSize]
  );

  const showLoadingRows = isLoading || (isFetching && vehicles.length === 0);

  const renderRows = () => {
    if (showLoadingRows) {
      return skeletonRows.map((index) => (
        <TableRow key={`vehicle-loading-${index}`}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-9 w-9" />
          </TableCell>
        </TableRow>
      ));
    }

    if (vehicles.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="py-12">
            <div className="text-center text-sm text-muted-foreground">
              {keyword.trim()
                ? "Không tìm thấy xe phù hợp. Vui lòng thử từ khóa khác."
                : 'Chưa có xe nào trong hệ thống. Nhấn "Thêm xe" để bắt đầu.'}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return vehicles.map((vehicle) => (
      <TableRow key={vehicle.id}>
        <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
        <TableCell>{vehicle.brand}</TableCell>
        <TableCell>{vehicle.model}</TableCell>
        <TableCell>
          <Badge variant={statusVariantMap[vehicle.status]}>
            {vehicleStatusLabels[vehicle.status]}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="outline" onClick={() => onEdit?.(vehicle)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-2 md:max-w-sm">
        <Input
          placeholder="Tìm kiếm xe (biển/hãng/mẫu)"
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
              <TableHead>Biển số</TableHead>
              <TableHead>Hãng xe</TableHead>
              <TableHead>Mẫu xe</TableHead>
              <TableHead>Trạng thái</TableHead>
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
    </div>
  );
}
