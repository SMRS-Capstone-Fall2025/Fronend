import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import type { MentorProjectPerformanceDto } from "@/services/dean-stats";
import { useMentorProjectsPerformanceQuery } from "@/services/dean-stats";
import {
  Activity,
  Award,
  GraduationCap,
  Search,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DeanLayout from "./layout";

export default function DeanMentorProjectsPerformancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const { data: allData = [], isLoading } = useMentorProjectsPerformanceQuery();

  const statistics = useMemo(() => {
    const totalMentors = allData.length;
    const totalProjects = allData.reduce(
      (sum, item) => sum + (item.projectsCount ?? 0),
      0
    );
    const totalCompleted = allData.reduce(
      (sum, item) => sum + (item.completedProjects ?? 0),
      0
    );
    const totalActive = allData.reduce(
      (sum, item) => sum + (item.activeProjects ?? 0),
      0
    );
    const avgScore =
      allData.length > 0
        ? allData.reduce((sum, item) => sum + (item.averageScore ?? 0), 0) /
          allData.length
        : 0;
    const avgProgress =
      totalProjects > 0
        ? Math.round((totalCompleted / totalProjects) * 100)
        : 0;

    return {
      totalMentors,
      totalProjects,
      totalCompleted,
      totalActive,
      avgScore,
      avgProgress,
    };
  }, [allData]);

  const filteredData = useMemo(() => {
    let result = allData;

    if (debouncedSearch.trim()) {
      const keyword = debouncedSearch.trim().toLowerCase();
      result = result.filter((item) => {
        const sources = [
          item.lecturerName?.toLowerCase(),
          item.lecturerEmail?.toLowerCase(),
        ];
        return sources.some((value) => value?.includes(keyword));
      });
    }

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return (a.lecturerName ?? "").localeCompare(b.lecturerName ?? "");
          case "name-desc":
            return (b.lecturerName ?? "").localeCompare(a.lecturerName ?? "");
          case "projects-asc":
            return a.projectsCount - b.projectsCount;
          case "projects-desc":
            return b.projectsCount - a.projectsCount;
          case "score-asc":
            return a.averageScore - b.averageScore;
          case "score-desc":
            return b.averageScore - a.averageScore;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [allData, debouncedSearch, sortBy]);

  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredData.length);
  }, [filteredData.length, pagination]);

  useEffect(() => {
    pagination.setPage(1);
  }, [debouncedSearch, sortBy, pagination]);

  const hasActiveFilters = Boolean(searchTerm.trim() || sortBy);

  const columns: DataTableColumn<MentorProjectPerformanceDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_item, index) => {
          const globalIndex =
            (pagination.page - 1) * pagination.pageSize + index + 1;
          return <span className="text-muted-foreground">{globalIndex}</span>;
        },
      },
      {
        id: "lecturer",
        header: "Giảng viên",
        headerClassName: "text-center",
        render: (item) => {
          const lecturerName = item.lecturerName ?? "Chưa cập nhật";
          const lecturerEmail = item.lecturerEmail ?? "—";
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-border/50 shrink-0">
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  {lecturerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground line-clamp-1 text-base">
                  {lecturerName}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {lecturerEmail}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "projectsCount",
        header: "Tổng dự án",
        headerClassName: "text-center",
        className: "text-center",
        render: (item) => (
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">
              {item.projectsCount}
            </span>
          </div>
        ),
      },
      {
        id: "completedProjects",
        header: "Đã hoàn thành",
        headerClassName: "text-center",
        className: "text-center",
        render: (item) => (
          <Badge
            variant="outline"
            className="text-sm font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
          >
            {item.completedProjects}
          </Badge>
        ),
      },
      {
        id: "averageScore",
        header: "Điểm TB",
        headerClassName: "text-center",
        className: "text-center",
        render: (item) => {
          const score = item.averageScore ?? 0;
          const hasScore = score > 0;
          const scoreColor = hasScore
            ? score >= 8
              ? "text-emerald-600 dark:text-emerald-400"
              : score >= 6
              ? "text-blue-600 dark:text-blue-400"
              : "text-amber-600 dark:text-amber-400"
            : "text-muted-foreground";

          return (
            <div className="flex items-center justify-center gap-2">
              {hasScore && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-4 w-4 text-primary" />
                </div>
              )}
              <span className={cn("text-lg font-bold", scoreColor)}>
                {hasScore ? score.toFixed(1) : "-"}
              </span>
            </div>
          );
        },
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  return (
    <DeanLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Nhóm hướng dẫn
              </h1>
              <p className="text-sm text-muted-foreground">
                Xem thống kê hiệu suất của các giảng viên hướng dẫn dự án
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tổng giảng viên
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.totalMentors}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tổng dự án
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.totalProjects}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Đã hoàn thành
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.totalCompleted}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-amber-50/50 to-background dark:from-amber-950/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Điểm TB
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {statistics.avgScore > 0
                      ? statistics.avgScore.toFixed(1)
                      : "-"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchTerm(value);
                }}
                className="pl-9"
                placeholder="Tìm theo tên hoặc email giảng viên..."
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-filter" className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Tên A-Z</SelectItem>
                <SelectItem value="name-desc">Tên Z-A</SelectItem>
                <SelectItem value="projects-asc">Dự án: Tăng dần</SelectItem>
                <SelectItem value="projects-desc">Dự án: Giảm dần</SelectItem>
                <SelectItem value="score-asc">Điểm: Tăng dần</SelectItem>
                <SelectItem value="score-desc">Điểm: Giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={paginatedData}
              isLoading={isLoading}
              emptyMessage={
                hasActiveFilters
                  ? "Không tìm thấy giảng viên phù hợp"
                  : "Chưa có dữ liệu"
              }
              emptyIcon={
                <div className="rounded-full bg-muted p-4">
                  <GraduationCap className="h-8 w-8 text-muted-foreground/60" />
                </div>
              }
              keyExtractor={(item) => String(item.lecturerId)}
            />
          </CardContent>
        </Card>

        {filteredData.length > 0 && (
          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            hasNext={pagination.hasNext}
            hasPrevious={pagination.hasPrevious}
            isLoading={isLoading}
            onPrevious={pagination.previousPage}
            onNext={pagination.nextPage}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        )}
      </div>
    </DeanLayout>
  );
}
