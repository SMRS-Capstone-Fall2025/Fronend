import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  adminStatsService,
  type ActivityDto,
  type AdminOverviewDto,
  type ProjectsTimelineDto,
  type RecentActivitiesPageResponse,
  type SystemHealthDto,
  type TopUserDto,
} from "./service";

const adminStatsKey = ["admin-stats"] as const;

export const adminStatsQueryKeys = {
  all: adminStatsKey,
  overview: () => [...adminStatsKey, "overview"] as const,
  projectsByStatus: () => [...adminStatsKey, "projects-by-status"] as const,
  projectsTimeline: (year?: number, months?: number) =>
    [...adminStatsKey, "projects-timeline", year, months] as const,
  usersByRole: () => [...adminStatsKey, "users-by-role"] as const,
  topUsers: (limit?: number) => [...adminStatsKey, "top-users", limit] as const,
  recentActivities: (limit?: number) =>
    [...adminStatsKey, "recent-activities", limit] as const,
  recentActivitiesPaginated: (page?: number, size?: number) =>
    [...adminStatsKey, "recent-activities-paginated", page, size] as const,
  systemHealth: () => [...adminStatsKey, "system-health"] as const,
};

export const useAdminOverviewQuery = (
  options?: UseQueryOptions<AdminOverviewDto, Error>
) => {
  return useQuery<AdminOverviewDto, Error>({
    queryKey: adminStatsQueryKeys.overview(),
    queryFn: () => adminStatsService.getOverview(),
    ...(options ?? {}),
  });
};

export const useProjectsByStatusQuery = (
  options?: UseQueryOptions<Record<string, number>, Error>
) => {
  return useQuery<Record<string, number>, Error>({
    queryKey: adminStatsQueryKeys.projectsByStatus(),
    queryFn: () => adminStatsService.getProjectsByStatus(),
    ...(options ?? {}),
  });
};

export const useProjectsTimelineQuery = (
  year?: number,
  months?: number,
  options?: UseQueryOptions<ProjectsTimelineDto, Error>
) => {
  return useQuery<ProjectsTimelineDto, Error>({
    queryKey: adminStatsQueryKeys.projectsTimeline(year, months),
    queryFn: () => adminStatsService.getProjectsTimeline(year, months),
    ...(options ?? {}),
  });
};

export const useUsersByRoleQuery = (
  options?: UseQueryOptions<Record<string, number>, Error>
) => {
  return useQuery<Record<string, number>, Error>({
    queryKey: adminStatsQueryKeys.usersByRole(),
    queryFn: () => adminStatsService.getUsersByRole(),
    ...(options ?? {}),
  });
};

export const useTopUsersQuery = (
  limit = 10,
  options?: UseQueryOptions<readonly TopUserDto[], Error>
) => {
  return useQuery<readonly TopUserDto[], Error>({
    queryKey: adminStatsQueryKeys.topUsers(limit),
    queryFn: () => adminStatsService.getTopUsers(limit),
    ...(options ?? {}),
  });
};

export const useRecentActivitiesQuery = (
  limit = 20,
  options?: UseQueryOptions<readonly ActivityDto[], Error>
) => {
  return useQuery<readonly ActivityDto[], Error>({
    queryKey: adminStatsQueryKeys.recentActivities(limit),
    queryFn: () => adminStatsService.getRecentActivities(limit),
    ...(options ?? {}),
  });
};

export const useRecentActivitiesPaginatedQuery = (
  page = 1,
  size = 20,
  options?: UseQueryOptions<RecentActivitiesPageResponse, Error>
) => {
  return useQuery<RecentActivitiesPageResponse, Error>({
    queryKey: adminStatsQueryKeys.recentActivitiesPaginated(page, size),
    queryFn: () => adminStatsService.getRecentActivitiesPaginated(page, size),
    ...(options ?? {}),
  });
};

export const useSystemHealthQuery = (
  options?: UseQueryOptions<SystemHealthDto, Error>
) => {
  return useQuery<SystemHealthDto, Error>({
    queryKey: adminStatsQueryKeys.systemHealth(),
    queryFn: () => adminStatsService.getSystemHealth(),
    refetchInterval: 30000,
    ...(options ?? {}),
  });
};

