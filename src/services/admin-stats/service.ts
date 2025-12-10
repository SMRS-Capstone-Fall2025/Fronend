import { apiClient } from "@/lib/api/mutator";
import type {
  ApiEnvelope,
  ApiResponse,
  PaginatedResult,
} from "../types/common";

export interface AdminOverviewDto {
  readonly totalProjects: number;
  readonly totalUsers: number;
  readonly totalCouncils: number;
  readonly activeProjects: number;
  readonly projectsGrowth?: string | null;
  readonly usersGrowth?: string | null;
  readonly councilsGrowth?: string | null;
  readonly activeProjectsGrowth?: string | null;
}

export interface ProjectsTimelineDto {
  readonly labels: readonly string[];
  readonly created: readonly number[];
  readonly completed: readonly number[];
}

export interface TopUserDto {
  readonly userId: number;
  readonly userName: string;
  readonly role: string;
  readonly userEmail: string;
  readonly projectsCount: number;
  readonly averageScore: number;
  readonly activityLevel?: string | null;
}

export interface ActivityDto {
  readonly type: string;
  readonly description: string;
  readonly userId?: number | null;
  readonly userName?: string | null;
  readonly projectId?: number | null;
  readonly projectName?: string | null;
  readonly timestamp: string;
  readonly icon?: string | null;
}

export interface SystemHealthDto {
  readonly systemStatus: string;
  readonly activeUsers: number;
  readonly responseTime: string;
  readonly uptime: string;
  readonly storageUsed: string;
}

export type ProjectsByStatusResponse = ApiResponse<Record<string, number>>;
export type UsersByRoleResponse = ApiResponse<Record<string, number>>;
export type AdminOverviewResponse = ApiResponse<AdminOverviewDto>;
export type ProjectsTimelineResponse = ApiResponse<ProjectsTimelineDto>;
export type TopUsersResponse = ApiResponse<readonly TopUserDto[]>;
export type RecentActivitiesResponse = ApiResponse<readonly ActivityDto[]>;
export type RecentActivitiesPaginatedResponse = ApiEnvelope<
  readonly ActivityDto[]
>;
export type SystemHealthResponse = ApiResponse<SystemHealthDto>;

export type RecentActivitiesPageResponse = {
  readonly message?: string | null;
  readonly data: PaginatedResult<ActivityDto>;
};

export const adminStatsService = {
  async getOverview(): Promise<AdminOverviewDto> {
    const response = await apiClient.get<AdminOverviewResponse>(
      "/api/stats/admin/overview"
    );
    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }
    return response.data.data;
  },

  async getProjectsByStatus(): Promise<Record<string, number>> {
    const response = await apiClient.get<ProjectsByStatusResponse>(
      "/api/stats/admin/projects-by-status"
    );
    return response.data?.data ?? {};
  },

  async getProjectsTimeline(
    year?: number,
    months?: number
  ): Promise<ProjectsTimelineDto> {
    const params = new URLSearchParams();
    if (year !== undefined) params.append("year", String(year));
    if (months !== undefined) params.append("months", String(months));

    const response = await apiClient.get<ProjectsTimelineResponse>(
      `/api/stats/admin/projects-timeline${
        params.toString() ? `?${params.toString()}` : ""
      }`
    );
    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }
    return response.data.data;
  },

  async getUsersByRole(): Promise<Record<string, number>> {
    const response = await apiClient.get<UsersByRoleResponse>(
      "/api/stats/admin/users-by-role"
    );
    return response.data?.data ?? {};
  },

  async getTopUsers(limit = 10): Promise<readonly TopUserDto[]> {
    const response = await apiClient.get<TopUsersResponse>(
      `/api/stats/admin/top-users?limit=${limit}`
    );
    return response.data?.data ?? [];
  },

  async getRecentActivities(limit = 20): Promise<readonly ActivityDto[]> {
    const response = await apiClient.get<RecentActivitiesResponse>(
      `/api/stats/admin/recent-activities?limit=${limit}`
    );
    return response.data?.data ?? [];
  },

  async getRecentActivitiesPaginated(
    page = 1,
    size = 20
  ): Promise<RecentActivitiesPageResponse> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(size));

    const response = await apiClient.get<RecentActivitiesPaginatedResponse>(
      `/api/stats/admin/recent-activities?${params.toString()}`
    );

    const raw = response.data ?? {};
    const items = Array.isArray(raw.data) ? raw.data : [];
    const pagination = raw.pagination;

    const totalElements = pagination?.totalElements ?? items.length;
    const pageNumber = pagination?.pageNumber ?? page;
    const pageSize = pagination?.pageSize ?? size;

    return {
      message: raw.message ?? null,
      data: {
        totalItems: totalElements,
        page: pageNumber,
        pageSize: pageSize,
        items: items,
      },
    };
  },

  async getSystemHealth(): Promise<SystemHealthDto> {
    const response = await apiClient.get<SystemHealthResponse>(
      "/api/stats/admin/system-health"
    );
    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }
    return response.data.data;
  },
};
