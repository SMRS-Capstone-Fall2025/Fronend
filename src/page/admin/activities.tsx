import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import type { ActivityDto } from "@/services/admin-stats";
import { useRecentActivitiesPaginatedQuery } from "@/services/admin-stats";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import AdminLayout from "./layout";

const ACTIVITY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  project_created: FileText,
  project_submitted: FileText,
  project_approved: CheckCircle2,
  project_rejected: XCircle,
  member_added: UserPlus,
  comment_added: MessageSquare,
  default: Clock,
};

const ACTIVITY_LABELS: Record<string, string> = {
  project_created: "Tạo dự án",
  project_submitted: "Nộp dự án",
  project_approved: "Duyệt dự án",
  project_rejected: "Từ chối dự án",
  member_added: "Thêm thành viên",
  comment_added: "Thêm bình luận",
};

const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return format(date, "dd/MM/yyyy HH:mm:ss", { locale: vi });
  } catch {
    return timestamp;
  }
};

const getActivityIcon = (type: string) => {
  const Icon =
    ACTIVITY_ICONS[type] ||
    ACTIVITY_ICONS[type.toLowerCase()] ||
    ACTIVITY_ICONS.default;
  return Icon;
};

function AdminActivitiesPage() {
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const {
    data: activitiesPage,
    isLoading,
    isFetching,
  } = useRecentActivitiesPaginatedQuery(pagination.page, pagination.pageSize);

  const activities = activitiesPage?.data?.items ?? [];
  const totalItems = activitiesPage?.data?.totalItems ?? 0;

  useEffect(() => {
    if (activitiesPage?.data?.totalItems !== undefined) {
      pagination.setTotalItems(activitiesPage.data.totalItems);
    }
  }, [activitiesPage?.data?.totalItems, pagination]);

  const columns: DataTableColumn<ActivityDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => {
          const globalIndex =
            (pagination.page - 1) * pagination.pageSize + index + 1;
          return <span className="text-muted-foreground">{globalIndex}</span>;
        },
      },
      {
        id: "type",
        header: "Loại hoạt động",
        width: "180px",
        render: (activity) => {
          const Icon = getActivityIcon(activity.type);
          const label =
            ACTIVITY_LABELS[activity.type] ||
            ACTIVITY_LABELS[activity.type.toLowerCase()] ||
            activity.type;

          return (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1.5">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="outline">{label}</Badge>
            </div>
          );
        },
      },
      {
        id: "description",
        header: "Mô tả",
        render: (activity) => (
          <div className="font-medium">{activity.description}</div>
        ),
      },
      {
        id: "project",
        header: "Dự án",
        width: "200px",
        render: (activity) => {
          if (!activity.projectName) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <div>
              <div className="text-sm font-medium">{activity.projectName}</div>
              {activity.projectId && (
                <div className="text-xs text-muted-foreground">
                  ID: {activity.projectId}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "user",
        header: "Người thực hiện",
        width: "180px",
        render: (activity) => {
          if (!activity.userName) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <div>
              <div className="text-sm font-medium">{activity.userName}</div>
              {activity.userId && (
                <div className="text-xs text-muted-foreground">
                  ID: {activity.userId}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "timestamp",
        header: "Thời gian",
        width: "180px",
        render: (activity) => (
          <div className="text-sm text-muted-foreground">
            {formatTimestamp(activity.timestamp)}
          </div>
        ),
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hoạt động hệ thống
            </h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi tất cả các hoạt động trong hệ thống
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={activities}
        isLoading={isLoading || (isFetching && activities.length === 0)}
        emptyMessage="Không có hoạt động nào"
        emptyIcon={<Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />}
        keyExtractor={(activity, index) =>
          `${activity.timestamp}-${activity.type}-${index}`
        }
      />

      {totalItems > 0 && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={totalItems}
          totalPages={pagination.totalPages}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          hasNext={pagination.hasNext}
          hasPrevious={pagination.hasPrevious}
          isLoading={isLoading}
          isFetching={isFetching}
          onPrevious={pagination.previousPage}
          onNext={pagination.nextPage}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          pageSizeOptions={[5, 10, 20, 50, 100]}
        />
      )}
    </div>
  );
}

export default function AdminActivities() {
  return (
    <AdminLayout>
      <AdminActivitiesPage />
    </AdminLayout>
  );
}
