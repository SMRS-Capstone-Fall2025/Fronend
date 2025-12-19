import { apiClient } from "@/lib/api/mutator";
import type { ApiResponse } from "../types/common";

export interface StudentOverviewDto {
  readonly myProjects: number;
  readonly projectsAsOwner: number;
  readonly completedProjects: number;
  readonly averageScore: number;
  readonly projectsGrowth?: string | null;
  readonly ownerGrowth?: string | null;
  readonly completedGrowth?: string | null;
  readonly scoreGrowth?: string | null;
}

export interface ScoreTrendDto {
  readonly labels?: readonly string[];
  readonly myScores?: readonly number[];
  readonly classAverage?: readonly number[];
}

export interface ScoreComparisonDto {
  readonly myAverageScore: number;
  readonly classAverageScore: number;
  readonly ranking: number;
  readonly totalStudents: number;
  readonly percentile?: string | null;
}

export interface ProjectProgressDto {
  readonly projectId: number;
  readonly projectName: string;
  readonly myRole: string;
  readonly status: string;
  readonly progress?: string | null;
  readonly dueDate?: string | null;
  readonly daysLeft?: number | null;
  readonly hasScore: boolean;
  readonly currentScore?: number | null;
}

export interface DeadlineDto {
  readonly projectId: number;
  readonly projectName: string;
  readonly milestone: string;
  readonly dueDate: string;
  readonly daysLeft: number;
  readonly status: string;
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

export type StudentOverviewResponse = ApiResponse<StudentOverviewDto>;
export type MyProjectsStatusResponse = ApiResponse<Record<string, number>>;
export type MyRolesResponse = ApiResponse<Record<string, number>>;
export type ScoreTrendResponse = ApiResponse<Record<string, readonly number[]>>;
export type ProjectsProgressResponse = ApiResponse<
  readonly ProjectProgressDto[]
>;
export type RecentActivitiesResponse = ApiResponse<readonly ActivityDto[]>;
export type ScoreComparisonResponse = ApiResponse<ScoreComparisonDto>;
export type UpcomingDeadlinesResponse = ApiResponse<readonly DeadlineDto[]>;

export const studentStatsService = {
  async getOverview(): Promise<StudentOverviewDto> {
    const response = await apiClient.get<StudentOverviewResponse>(
      "/api/stats/student/overview"
    );
    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }
    return response.data.data;
  },

  async getMyProjectsStatus(): Promise<Record<string, number>> {
    const response = await apiClient.get<MyProjectsStatusResponse>(
      "/api/stats/student/my-projects-status"
    );
    return response.data?.data ?? {};
  },

  async getMyRoles(): Promise<Record<string, number>> {
    const response = await apiClient.get<MyRolesResponse>(
      "/api/stats/student/my-roles"
    );
    return response.data?.data ?? {};
  },

  async getScoreTrend(): Promise<ScoreTrendDto> {
    const response = await apiClient.get<ScoreTrendResponse>(
      "/api/stats/student/score-trend"
    );
    const data = response.data?.data ?? {};

    const labels: string[] = [];
    const myScores: number[] = [];
    const classAverage: number[] = [];

    if (Array.isArray(data.labels) || Array.isArray(data.myScores)) {
      return {
        labels: Array.isArray(data.labels) ? data.labels : undefined,
        myScores: Array.isArray(data.myScores) ? data.myScores : undefined,
        classAverage: Array.isArray(data.classAverage)
          ? data.classAverage
          : undefined,
      };
    }

    Object.keys(data).forEach((key) => {
      const values = data[key];
      if (Array.isArray(values) && values.length >= 2) {
        labels.push(key);
        myScores.push(Number(values[0]) ?? 0);
        classAverage.push(Number(values[1]) ?? 0);
      }
    });

    return {
      labels: labels.length > 0 ? labels : undefined,
      myScores: myScores.length > 0 ? myScores : undefined,
      classAverage: classAverage.length > 0 ? classAverage : undefined,
    };
  },

  async getProjectsProgress(): Promise<readonly ProjectProgressDto[]> {
    const response = await apiClient.get<ProjectsProgressResponse>(
      "/api/stats/student/projects-progress"
    );
    return response.data?.data ?? [];
  },

  async getRecentActivities(limit = 15): Promise<readonly ActivityDto[]> {
    const response = await apiClient.get<RecentActivitiesResponse>(
      `/api/stats/student/recent-activities?limit=${limit}`
    );
    return response.data?.data ?? [];
  },

  async getScoreComparison(): Promise<ScoreComparisonDto> {
    const response = await apiClient.get<ScoreComparisonResponse>(
      "/api/stats/student/score-comparison"
    );
    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }
    return response.data.data;
  },

  async getUpcomingDeadlines(): Promise<readonly DeadlineDto[]> {
    const response = await apiClient.get<UpcomingDeadlinesResponse>(
      "/api/stats/student/upcoming-deadlines"
    );
    return response.data?.data ?? [];
  },
};
