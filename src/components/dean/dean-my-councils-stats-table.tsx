import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { CouncilPerformanceDto } from "@/services/dean-stats";
import { Building2 } from "lucide-react";
import { useMemo } from "react";

interface DeanMyCouncilsStatsTableProps {
  data?: readonly CouncilPerformanceDto[];
  isLoading?: boolean;
}

export function DeanMyCouncilsStatsTable({
  data,
  isLoading,
}: DeanMyCouncilsStatsTableProps) {
  const columns: DataTableColumn<CouncilPerformanceDto>[] = useMemo(
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
        id: "councilName",
        header: "Hội đồng",
        render: (council) => (
          <div className="font-medium">{council.councilName}</div>
        ),
      },
      {
        id: "councilCode",
        header: "Mã",
        className: "text-center",
        render: (council) => (
          <Badge variant="outline">{council.councilCode}</Badge>
        ),
      },
      {
        id: "totalProjects",
        header: "Tổng dự án",
        className: "text-center",
        render: (council) => <span>{council.totalProjects}</span>,
      },
      {
        id: "completedProjects",
        header: "Đã hoàn thành",
        className: "text-center",
        render: (council) => (
          <Badge variant="secondary">{council.completedProjects}</Badge>
        ),
      },
      {
        id: "activeMembers",
        header: "Thành viên",
        className: "text-center",
        render: (council) => <span>{council.activeMembers}</span>,
      },
      {
        id: "averageScore",
        header: "Điểm TB",
        className: "text-right",
        render: (council) => (
          <span className="font-bold">
            {council.averageScore > 0 ? council.averageScore.toFixed(2) : "-"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <Card
      className="overflow-hidden opacity-0 animate-fade-in-up"
      style={{
        animationDelay: "500ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader>
        <CardTitle>Hội đồng tham gia</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          emptyMessage="Không có dữ liệu"
          emptyIcon={
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          }
          keyExtractor={(council) => String(council.councilId)}
        />
      </CardContent>
    </Card>
  );
}
