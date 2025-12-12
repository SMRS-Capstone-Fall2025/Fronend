import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Progress } from "@/components/ui/progress";
import type { MentorProjectPerformanceDto } from "@/services/dean-stats";
import { GraduationCap } from "lucide-react";
import { useMemo } from "react";

interface DeanMentorProjectsPerformanceTableProps {
  data?: readonly MentorProjectPerformanceDto[];
  isLoading?: boolean;
}

export function DeanMentorProjectsPerformanceTable({
  data,
  isLoading,
}: DeanMentorProjectsPerformanceTableProps) {
  const columns: DataTableColumn<MentorProjectPerformanceDto>[] = useMemo(
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
        id: "lecturer",
        header: "Giảng viên",
        render: (item) => (
          <div>
            <div className="font-medium">{item.lecturerName}</div>
            <div className="text-xs text-muted-foreground">
              {item.lecturerEmail}
            </div>
          </div>
        ),
      },
      {
        id: "projectsCount",
        header: "Tổng dự án",
        className: "text-center",
        render: (item) => <span>{item.projectsCount}</span>,
      },
      {
        id: "completedProjects",
        header: "Đã hoàn thành",
        className: "text-center",
        render: (item) => (
          <Badge variant="outline">{item.completedProjects}</Badge>
        ),
      },
      {
        id: "progress",
        header: "Tiến độ",
        className: "min-w-[150px]",
        render: (item) => {
          const progressValue =
            item.projectsCount > 0
              ? Math.round((item.completedProjects / item.projectsCount) * 100)
              : 0;

          return (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{progressValue}%</span>
                <span className="text-muted-foreground">
                  {item.activeProjects} đang hoạt động
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          );
        },
      },
      {
        id: "averageScore",
        header: "Điểm TB",
        className: "text-right",
        render: (item) => (
          <span className="font-bold">
            {item.averageScore > 0 ? item.averageScore.toFixed(2) : "-"}
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
        animationDelay: "400ms",
        animationFillMode: "forwards",
      }}
    >
      <CardHeader>
        <CardTitle>Nhóm hướng dẫn</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          emptyMessage="Không có dữ liệu"
          emptyIcon={
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
          }
          keyExtractor={(item) => String(item.lecturerId)}
        />
      </CardContent>
    </Card>
  );
}
