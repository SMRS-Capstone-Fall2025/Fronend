import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  ActivityDto,
  DeadlineDto,
  ProjectProgressDto,
  ScoreComparisonDto,
  ScoreTrendDto,
  StudentOverviewDto,
} from "./service";
import { studentStatsService } from "./service";

const studentStatsKey = ["student-stats"] as const;

export const studentStatsQueryKeys = {
  all: studentStatsKey,
  overview: () => [...studentStatsKey, "overview"] as const,
  myProjectsStatus: () => [...studentStatsKey, "my-projects-status"] as const,
  myRoles: () => [...studentStatsKey, "my-roles"] as const,
  scoreTrend: () => [...studentStatsKey, "score-trend"] as const,
  projectsProgress: () => [...studentStatsKey, "projects-progress"] as const,
  recentActivities: (limit?: number) =>
    [...studentStatsKey, "recent-activities", limit] as const,
  scoreComparison: () => [...studentStatsKey, "score-comparison"] as const,
  upcomingDeadlines: () => [...studentStatsKey, "upcoming-deadlines"] as const,
};

export const useStudentOverviewQuery = (
  options?: UseQueryOptions<StudentOverviewDto, Error>
) => {
  return useQuery<StudentOverviewDto, Error>({
    queryKey: studentStatsQueryKeys.overview(),
    queryFn: () => studentStatsService.getOverview(),
    ...options,
  });
};

export const useMyProjectsStatusQuery = (
  options?: UseQueryOptions<Record<string, number>, Error>
) => {
  return useQuery<Record<string, number>, Error>({
    queryKey: studentStatsQueryKeys.myProjectsStatus(),
    queryFn: () => studentStatsService.getMyProjectsStatus(),
    ...options,
  });
};

export const useMyRolesQuery = (
  options?: UseQueryOptions<Record<string, number>, Error>
) => {
  return useQuery<Record<string, number>, Error>({
    queryKey: studentStatsQueryKeys.myRoles(),
    queryFn: () => studentStatsService.getMyRoles(),
    ...options,
  });
};

export const useScoreTrendQuery = (
  options?: UseQueryOptions<ScoreTrendDto, Error>
) => {
  return useQuery<ScoreTrendDto, Error>({
    queryKey: studentStatsQueryKeys.scoreTrend(),
    queryFn: () => studentStatsService.getScoreTrend(),
    ...options,
  });
};

export const useProjectsProgressQuery = (
  options?: UseQueryOptions<readonly ProjectProgressDto[], Error>
) => {
  return useQuery<readonly ProjectProgressDto[], Error>({
    queryKey: studentStatsQueryKeys.projectsProgress(),
    queryFn: () => studentStatsService.getProjectsProgress(),
    ...options,
  });
};

export const useRecentActivitiesQuery = (
  limit = 15,
  options?: UseQueryOptions<readonly ActivityDto[], Error>
) => {
  return useQuery<readonly ActivityDto[], Error>({
    queryKey: studentStatsQueryKeys.recentActivities(limit),
    queryFn: () => studentStatsService.getRecentActivities(limit),
    ...options,
  });
};

export const useScoreComparisonQuery = (
  options?: UseQueryOptions<ScoreComparisonDto, Error>
) => {
  return useQuery<ScoreComparisonDto, Error>({
    queryKey: studentStatsQueryKeys.scoreComparison(),
    queryFn: () => studentStatsService.getScoreComparison(),
    ...options,
  });
};

export const useUpcomingDeadlinesQuery = (
  options?: UseQueryOptions<readonly DeadlineDto[], Error>
) => {
  return useQuery<readonly DeadlineDto[], Error>({
    queryKey: studentStatsQueryKeys.upcomingDeadlines(),
    queryFn: () => studentStatsService.getUpcomingDeadlines(),
    ...options,
  });
};
