import { StudentMyProjectsStatusChart } from "@/components/student/student-my-projects-status-chart";
import { StudentMyRolesChart } from "@/components/student/student-my-roles-chart";
import { StudentOverviewCards } from "@/components/student/student-overview-cards";
import { StudentScoreComparisonWidget } from "@/components/student/student-score-comparison-widget";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useMyProjectsStatusQuery,
  useMyRolesQuery,
  useRecentActivitiesQuery,
  useScoreComparisonQuery,
  useScoreTrendQuery,
  useStudentOverviewQuery,
} from "@/services/student-stats";
import { AlertCircle, LayoutDashboard } from "lucide-react";
import StudentLayout from "./layout";

function StudentDashboardContent() {
  const { data: overview, isLoading: overviewLoading } =
    useStudentOverviewQuery();
  const { data: myProjectsStatus, isLoading: myProjectsStatusLoading } =
    useMyProjectsStatusQuery();
  const { data: myRoles, isLoading: myRolesLoading } = useMyRolesQuery();
  const { isLoading: scoreTrendLoading } = useScoreTrendQuery();
  // const { data: projectsProgress, isLoading: projectsProgressLoading } =
  //   useProjectsProgressQuery();
  const { isLoading: recentActivitiesLoading } = useRecentActivitiesQuery(10);
  const { data: scoreComparison, isLoading: scoreComparisonLoading } =
    useScoreComparisonQuery();
  // const { data: upcomingDeadlines, isLoading: upcomingDeadlinesLoading } =
  //   useUpcomingDeadlinesQuery();

  const isLoading =
    overviewLoading ||
    myProjectsStatusLoading ||
    myRolesLoading ||
    scoreTrendLoading ||
    // projectsProgressLoading ||
    recentActivitiesLoading ||
    scoreComparisonLoading;
  // upcomingDeadlinesLoading;

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Tổng quan học tập
            </h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi tiến độ dự án và điểm số của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StudentOverviewCards data={overview} isLoading={overviewLoading} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div>
          <StudentMyProjectsStatusChart
            data={myProjectsStatus}
            isLoading={myProjectsStatusLoading}
          />
        </div>

        <div>
          <StudentMyRolesChart data={myRoles} isLoading={myRolesLoading} />
        </div>

        <div>
          <StudentScoreComparisonWidget
            data={scoreComparison}
            isLoading={scoreComparisonLoading}
          />
        </div>
      </div>
      {/* 
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentProjectsProgressTable
            data={projectsProgress}
            isLoading={projectsProgressLoading}
          />
        </div>

        <div className="space-y-6">
          <StudentUpcomingDeadlinesList
            data={upcomingDeadlines}
            isLoading={upcomingDeadlinesLoading}
          />
        </div>
      </div> */}

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

export default function StudentDashboard() {
  return (
    <StudentLayout>
      <StudentDashboardContent />
    </StudentLayout>
  );
}
