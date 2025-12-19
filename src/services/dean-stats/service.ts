import { apiClient } from "@/lib/api/mutator";
import type { ApiResponse } from "../types/common";

export interface DeanOverviewDto {
  readonly totalCouncils: number;
  readonly pendingProjects: number;
  readonly approvedProjects: number;
  readonly totalLecturers: number;
  readonly councilsGrowth?: string | null;
  readonly pendingGrowth?: string | null;
  readonly approvedGrowth?: string | null;
  readonly lecturersGrowth?: string | null;
}

export interface TimelineChartDto {
  readonly labels: readonly string[];
  readonly dataset1: readonly number[];
  readonly dataset2: readonly number[];
  readonly dataset1Label?: string | null;
  readonly dataset2Label?: string | null;
}

export interface LecturerActivityDto {
  readonly lecturerId: number;
  readonly lecturerName: string;
  readonly lecturerEmail: string;
  readonly councilsCount: number;
  readonly projectsScored: number;
  readonly averageScoreGiven: number;
  readonly activityLevel?: string | null;
}

export interface CouncilPerformanceDto {
  readonly councilId: number;
  readonly councilName: string;
  readonly councilCode: string;
  readonly totalProjects: number;
  readonly completedProjects: number;
  readonly averageScore: number;
  readonly activeMembers: number;
  readonly completionRate?: string | null;
}

export interface MentorProjectPerformanceDto {
  readonly lecturerId: number;
  readonly lecturerName: string;
  readonly lecturerEmail: string;
  readonly projectsCount: number;
  readonly averageScore: number;
  readonly completedProjects: number;
  readonly activeProjects: number;
  readonly progress?: string | null;
}

export interface ScoringProgressDto {
  readonly total: number;
  readonly scored: number;
  readonly remaining: number;
  readonly progressPercentage: number;
}

export interface RecentScoreDto {
  readonly scoreId: number;
  readonly projectId: number;
  readonly projectName: string;
  readonly finalScore: number;
  readonly scoreDate: string;
  readonly councilName?: string | null;
}

export type DeanOverviewResponse = ApiResponse<DeanOverviewDto>;
export type ProjectsByDecisionResponse = ApiResponse<Record<string, number>>;
export type LecturerActivityResponse = ApiResponse<readonly LecturerActivityDto[]>;
export type CouncilPerformanceResponse = ApiResponse<readonly CouncilPerformanceDto[]>;
export type TimelineChartResponse = ApiResponse<TimelineChartDto>;
export type ScoringProgressResponse = ApiResponse<ScoringProgressDto>;
export type RecentScoresResponse = ApiResponse<readonly RecentScoreDto[]>;
export type ScoreDistributionResponse = ApiResponse<Record<string, number>>;

export const deanStatsService = {
  async getOverview(): Promise<DeanOverviewDto> {
    const response = await apiClient.get<DeanOverviewResponse>(
      "/api/stats/dean/overview"
    );
    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }
    return response.data.data;
  },

  async getMentorProjectsStatus(): Promise<Record<string, number>> {
    const response = await apiClient.get<ProjectsByDecisionResponse>(
      "/api/stats/dean/projects-by-decision"
    );
    return response.data?.data ?? {};
  },

  async getScoringProgress(): Promise<ScoringProgressDto> {

    const overview = await this.getOverview();
    const total = overview.pendingProjects + overview.approvedProjects;
    const scored = overview.approvedProjects;
    const remaining = overview.pendingProjects;
    const progressPercentage = total > 0 ? (scored / total) * 100 : 0;

    return {
      total,
      scored,
      remaining,
      progressPercentage,
    };
  },

  async getMentorProjectsPerformance(): Promise<readonly MentorProjectPerformanceDto[]> {

    const response = await apiClient.get<LecturerActivityResponse>(
      "/api/stats/dean/lecturers-activity"
    );
    const lecturers = response.data?.data ?? [];

    return lecturers.map((lecturer) => ({
      lecturerId: lecturer.lecturerId,
      lecturerName: lecturer.lecturerName,
      lecturerEmail: lecturer.lecturerEmail,
      projectsCount: lecturer.projectsScored + (lecturer.councilsCount * 2),
      averageScore: lecturer.averageScoreGiven,
      completedProjects: lecturer.projectsScored,
      activeProjects: lecturer.councilsCount,
      progress: lecturer.activityLevel,
    }));
  },

  async getMyCouncilsStats(): Promise<readonly CouncilPerformanceDto[]> {
    const response = await apiClient.get<CouncilPerformanceResponse>(
      "/api/stats/dean/councils-performance"
    );
    return response.data?.data ?? [];
  },

  async getRecentScores(limit = 20): Promise<readonly RecentScoreDto[]> {

    const response = await apiClient.get<RecentScoresResponse>(
      `/api/stats/dean/recent-scores?limit=${limit}`
    ).catch(() => ({
      data: { data: [] },
    }));
    return response.data?.data ?? [];
  },

  async getScoreDistribution(): Promise<Record<string, number>> {

    const response = await apiClient.get<ScoreDistributionResponse>(
      "/api/stats/dean/score-distribution"
    ).catch(() => ({
      data: { data: {} },
    }));
    return response.data?.data ?? {};
  },

  async getDecisionTimeline(
    year?: number,
    months?: number
  ): Promise<TimelineChartDto> {
    const params = new URLSearchParams();
    if (year !== undefined) params.append("year", String(year));
    if (months !== undefined) params.append("months", String(months));

    const response = await apiClient.get<TimelineChartResponse>(
      `/api/stats/dean/decision-timeline${
        params.toString() ? `?${params.toString()}` : ""
      }`
    );
    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }
    return response.data.data;
  },
};

