import { DeanMentorProjectsStatusChart } from "@/components/dean/dean-mentor-projects-status-chart";
import { DeanOverviewCards } from "@/components/dean/dean-overview-cards";
import { DeanScoringProgress } from "@/components/dean/dean-scoring-progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useDeanOverviewQuery,
  useMentorProjectsStatusQuery,
  useScoringProgressQuery,
} from "@/services/dean-stats";
import { AlertCircle, LayoutDashboard } from "lucide-react";
import DeanLayout from "./layout";

function DeanDashboardContent() {
  const { data: overview, isLoading: overviewLoading } = useDeanOverviewQuery();
  const { data: mentorProjectsStatus, isLoading: mentorProjectsStatusLoading } =
    useMentorProjectsStatusQuery();
  const { data: scoringProgress, isLoading: scoringProgressLoading } =
    useScoringProgressQuery();

  const isLoading =
    overviewLoading || mentorProjectsStatusLoading || scoringProgressLoading;

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bảng điều khiển trưởng bộ môn
            </h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi tiến độ phân công hội đồng và phê duyệt dự án trong khoa
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <DeanOverviewCards data={overview} isLoading={overviewLoading} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DeanMentorProjectsStatusChart
            data={mentorProjectsStatus}
            isLoading={mentorProjectsStatusLoading}
          />
        </div>
        <div className="space-y-6">
          <DeanScoringProgress
            data={scoringProgress}
            isLoading={scoringProgressLoading}
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

export default function DeanDashboardPage() {
  return (
    <DeanLayout>
      <DeanDashboardContent />
    </DeanLayout>
  );
}
