import { AdminOverviewCards } from "@/components/admin/admin-overview-cards";
import { AdminProjectsByStatusChart } from "@/components/admin/admin-projects-by-status-chart";
import { AdminProjectsTimelineChart } from "@/components/admin/admin-projects-timeline-chart";
import { AdminRecentActivitiesList } from "@/components/admin/admin-recent-activities-list";
import { AdminTopUsersTable } from "@/components/admin/admin-top-users-table";
import { AdminUsersByRoleChart } from "@/components/admin/admin-users-by-role-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useAdminOverviewQuery,
  useProjectsByStatusQuery,
  useProjectsTimelineQuery,
  useRecentActivitiesQuery,
  useSystemHealthQuery,
  useTopUsersQuery,
  useUsersByRoleQuery,
} from "@/services/admin-stats";
import { AlertCircle, LayoutDashboard } from "lucide-react";
import AdminLayout from "./layout";

function AdminDashboardPage() {
  const { data: overview, isLoading: overviewLoading } =
    useAdminOverviewQuery();
  const { data: projectsByStatus, isLoading: projectsByStatusLoading } =
    useProjectsByStatusQuery();
  const { data: projectsTimeline, isLoading: timelineLoading } =
    useProjectsTimelineQuery();
  const { data: usersByRole, isLoading: usersByRoleLoading } =
    useUsersByRoleQuery();
  const { data: topUsers, isLoading: topUsersLoading } = useTopUsersQuery(10);
  const { data: recentActivities, isLoading: activitiesLoading } =
    useRecentActivitiesQuery(20);
  const { data: systemHealth, isLoading: healthLoading } =
    useSystemHealthQuery();

  const isLoading =
    overviewLoading ||
    projectsByStatusLoading ||
    timelineLoading ||
    usersByRoleLoading ||
    topUsersLoading ||
    activitiesLoading ||
    healthLoading;

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bảng điều khiển quản trị
            </h1>
            <p className="text-sm text-muted-foreground">
              Tổng quan về hệ thống, dự án và người dùng
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden min-w-0">
        <AdminOverviewCards data={overview} isLoading={overviewLoading} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <AdminProjectsByStatusChart
          data={projectsByStatus}
          isLoading={projectsByStatusLoading}
        />
        <AdminUsersByRoleChart
          data={usersByRole}
          isLoading={usersByRoleLoading}
        />
        {/* <AdminSystemHealthWidget
          data={systemHealth}
          isLoading={healthLoading}
        /> */}
      </div>

      <div className="overflow-hidden">
        <AdminProjectsTimelineChart
          data={projectsTimeline}
          isLoading={timelineLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 overflow-hidden">
        <div className="lg:col-span-2 min-w-0">
          <AdminTopUsersTable data={topUsers} isLoading={topUsersLoading} />
        </div>
        <div className="min-w-0">
          <AdminRecentActivitiesList
            data={recentActivities}
            isLoading={activitiesLoading}
          />
        </div>
      </div>

      {!isLoading && !overview && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <AdminDashboardPage />
    </AdminLayout>
  );
}
