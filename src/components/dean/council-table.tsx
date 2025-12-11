import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { CouncilDto } from "@/services/types";
import { Eye, Pencil, Trash2, Building2 } from "lucide-react";
import { useMemo } from "react";
import { councilStatusPresentation } from "./council-details-dialog";

export interface CouncilTableProps {
  readonly councils: CouncilDto[];
  readonly isLoading?: boolean;
  readonly onView?: (council: CouncilDto) => void;
  readonly onEdit?: (council: CouncilDto) => void;
  readonly onDelete?: (council: CouncilDto) => void;
}

export function CouncilTable({
  councils,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: CouncilTableProps) {
  const columns: DataTableColumn<CouncilDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => (
          <span className="text-muted-foreground">{index + 1}</span>
        ),
      },
      {
        id: "councilCode",
        header: "Mã",
        className: "w-[120px]",
        render: (council) => (
          <span className="font-medium">{council.councilCode ?? "—"}</span>
        ),
      },
      {
        id: "councilName",
        header: "Tên hội đồng",
        render: (council) => (
          <span className="font-semibold text-foreground">
            {council.councilName ?? "Không rõ"}
          </span>
        ),
      },
      {
        id: "department",
        header: "Khoa",
        render: (council) => (
          <span className="text-muted-foreground">
            {council.department ?? "—"}
          </span>
        ),
      },
      {
        id: "members",
        header: "Thành viên",
        className: "w-[140px] text-center",
        render: (council) => (
          <span className="text-sm font-medium">
            {council.members?.length ?? 0}
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        className: "w-[140px]",
        render: (council) => {
          const statusConfig = councilStatusPresentation(council.status);
          return (
            <Badge
              variant={statusConfig.variant}
              className={cn("capitalize text-nowrap", statusConfig.className)}
            >
              {statusConfig.label}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        className: "w-[120px] text-right",
        headerClassName: "text-right",
        render: (council) => (
          <div className="flex items-center justify-end gap-1">
            {onView ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => onView(council)}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">
                  Xem {council.councilName ?? "hội đồng"}
                </span>
              </Button>
            ) : null}
            {onEdit && council.status?.toLowerCase() !== "inactive" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => onEdit(council)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">
                  Sửa {council.councilName ?? "hội đồng"}
                </span>
              </Button>
            ) : null}
            {onDelete && council.status?.toLowerCase() !== "inactive" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-destructive hover:text-destructive"
                onClick={() => onDelete(council)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">
                  Xóa {council.councilName ?? "hội đồng"}
                </span>
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [onView, onEdit, onDelete]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-background/80">
      <DataTable
        columns={columns}
        data={councils}
        isLoading={isLoading}
        emptyMessage="Chưa có hội đồng nào. Nhấn 'Tạo hội đồng' để bắt đầu."
        emptyIcon={<Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />}
        keyExtractor={(council) => String(council.id)}
      />
    </div>
  );
}
