import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Progress } from "@/components/ui/progress";
import type { ProjectProgressDto } from "@/services/student-stats";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, AlertTriangle, FolderKanban } from "lucide-react";
import { useMemo } from "react";

interface StudentProjectsProgressTableProps {
  data?: readonly ProjectProgressDto[];
  isLoading?: boolean;
}

const getStatusBadge = (
  status: string,
  daysLeft: number | null | undefined
) => {
  if (daysLeft !== null && daysLeft !== undefined) {
    if (daysLeft < 0) {
      return <Badge variant="destructive">Quá hạn</Badge>;
    }
    if (daysLeft <= 3) {
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          Sắp hết hạn
        </Badge>
      );
    }
  }
  if (status === "Completed") {
    return (
      <Badge variant="default" className="bg-green-600">
        Hoàn thành
      </Badge>
    );
  }
  if (status === "InProgress") {
    return <Badge variant="outline">Đang thực hiện</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
};

const parseProgress = (progress?: string | null) => {
  if (!progress) return 0;
  const match = progress.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
};

export function StudentProjectsProgressTable({
  data,
  isLoading,
}: StudentProjectsProgressTableProps) {
  const columns: DataTableColumn<ProjectProgressDto>[] = useMemo(
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
        id: "projectName",
        header: "Dự án",
        render: (project) => (
          <div className="font-medium">{project.projectName}</div>
        ),
      },
      {
        id: "myRole",
        header: "Vai trò",
        className: "text-center",
        render: (project) => (
          <Badge variant="secondary">{project.myRole}</Badge>
        ),
      },
      {
        id: "progress",
        header: "Tiến độ",
        className: "min-w-[150px] text-center",
        render: (project) => {
          const progressValue = parseProgress(project.progress);
          return (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          );
        },
      },
      {
        id: "dueDate",
        header: "Thời hạn",
        className: "text-center",
        render: (project) => {
          const dueDate = project.dueDate ? new Date(project.dueDate) : null;
          return dueDate ? (
            <div className="flex flex-col items-center gap-1">
              {getStatusBadge(project.status, project.daysLeft)}
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {project.daysLeft !== null && project.daysLeft !== undefined ? (
                  <>
                    {project.daysLeft < 0 ? (
                      <>
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span className="text-red-600">
                          {Math.abs(project.daysLeft)} ngày quá hạn
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>{project.daysLeft} ngày</span>
                      </>
                    )}
                  </>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(dueDate, "dd/MM/yyyy", { locale: vi })}
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          );
        },
      },
      {
        id: "currentScore",
        header: "Điểm",
        className: "text-right",
        render: (project) =>
          project.hasScore && project.currentScore !== null ? (
            <span className="font-bold">{project.currentScore.toFixed(2)}</span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
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
        <CardTitle>Tiến độ dự án</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          emptyMessage="Không có dữ liệu"
          emptyIcon={
            <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
          }
          keyExtractor={(project) => String(project.projectId)}
        />
      </CardContent>
    </Card>
  );
}
