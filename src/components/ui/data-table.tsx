import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface DataTableColumn<T> {
  readonly id: string;
  readonly header: string | React.ReactNode;
  readonly accessor?: keyof T | ((row: T) => React.ReactNode);
  readonly render?: (row: T, index: number) => React.ReactNode;
  readonly className?: string;
  readonly headerClassName?: string;
  readonly width?: string;
}

export interface DataTableProps<T> {
  readonly columns: readonly DataTableColumn<T>[];
  readonly data: readonly T[];
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
  readonly emptyIcon?: React.ReactNode;
  readonly onRowClick?: (row: T, index: number) => void;
  readonly rowClassName?: string | ((row: T, index: number) => string);
  readonly keyExtractor?: (row: T, index: number) => string | number;
  readonly loadingRows?: number;
  readonly renderLoadingRow?: (index: number) => React.ReactNode;
}

export function DataTable<T = unknown>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Không có dữ liệu",
  emptyIcon,
  onRowClick,
  rowClassName = "group hover:bg-muted/50 transition-colors",
  keyExtractor,
  loadingRows = 5,
  renderLoadingRow,
}: DataTableProps<T>) {
  const getRowKey = React.useCallback(
    (row: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(row, index);
      }

      if (
        typeof row === "object" &&
        row !== null &&
        "id" in row &&
        row.id != null
      ) {
        return String(row.id);
      }
      return index;
    },
    [keyExtractor]
  );

  const getRowClassName = React.useCallback(
    (row: T, index: number) => {
      if (typeof rowClassName === "function") {
        return rowClassName(row, index);
      }
      return rowClassName;
    },
    [rowClassName]
  );

  const renderCell = React.useCallback(
    (column: DataTableColumn<T>, row: T, index: number) => {
      if (column.render) {
        return column.render(row, index);
      }

      if (column.accessor) {
        if (typeof column.accessor === "function") {
          return column.accessor(row);
        }

        const value = row[column.accessor];
        if (value == null) {
          return <span className="text-muted-foreground">—</span>;
        }

        if (typeof value === "string" || typeof value === "number") {
          return <span>{String(value)}</span>;
        }

        return <span>{JSON.stringify(value)}</span>;
      }

      return <span className="text-muted-foreground">—</span>;
    },
    []
  );

  const defaultLoadingRow = React.useCallback(
    (index: number) => (
      <TableRow key={`loading-${index}`}>
        {columns.map((column) => (
          <TableCell key={column.id} className={column.className}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ),
    [columns]
  );

  const renderLoadingRows = () => {
    const rows = Array.from({ length: loadingRows }, (_, i) => i);
    if (renderLoadingRow) {
      return rows.map((index) => renderLoadingRow(index));
    }
    return rows.map((index) => defaultLoadingRow(index));
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-50 dark:bg-sky-950/30">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.headerClassName,
                    column.width && `w-[${column.width}]`
                  )}
                  style={
                    column.width
                      ? { width: column.width, minWidth: column.width }
                      : undefined
                  }
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{renderLoadingRows()}</TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-50 dark:bg-sky-950/30">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.headerClassName,
                    column.width && `w-[${column.width}]`
                  )}
                  style={
                    column.width
                      ? { width: column.width, minWidth: column.width }
                      : undefined
                  }
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyIcon && (
                    <div className="mb-3 flex justify-center">{emptyIcon}</div>
                  )}
                  <p>{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={getRowKey(row, index)}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    getRowClassName(row, index)
                  )}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={column.className}
                      style={
                        column.width
                          ? { width: column.width, minWidth: column.width }
                          : undefined
                      }
                    >
                      {renderCell(column, row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
