import { apiClient } from "@/lib/api/mutator";
import type {
  FinalReportListResponse,
  FinalReportListResult,
  MentorReviewListResponse,
  MentorReviewListResult,
  ProjectReviewListResponse,
  ProjectReviewListResult,
} from "../types/final-report";

export const finalReportService = {
  async list(params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Promise<FinalReportListResult> {
    const response = await apiClient.get<FinalReportListResponse>(
      "/api/projects/to-review",
      {
        params: {
          pageNumber: params?.pageNumber ?? 0,
          pageSize: params?.pageSize ?? 20,
        },
      }
    );

    return {
      reports: response.data?.data ?? [],
      pagination: response.data?.pagination ?? null,
      message: response.data?.message,
    };
  },

  async getProjectsToReview(): Promise<ProjectReviewListResult> {
    const response = await apiClient.get<ProjectReviewListResponse>(
      "/api/projects/to-review"
    );

    return {
      projects: response.data?.data ?? [],
      pagination: response.data?.pagination ?? null,
      message: response.data?.message,
    };
  },

  async getMyFinalReports(): Promise<ProjectReviewListResult> {
    const response = await apiClient.get<ProjectReviewListResponse>(
      "/api/projects/my-final-reports"
    );

    return {
      projects: response.data?.data ?? [],
      pagination: response.data?.pagination ?? null,
      message: response.data?.message,
    };
  },

  async getMentorReviews(): Promise<MentorReviewListResult> {
    const response = await apiClient.get<MentorReviewListResponse>(
      "/api/projects/to-review"
    );

    return {
      projects: response.data?.data ?? [],
      pagination: response.data?.pagination ?? null,
      message: response.data?.message,
    };
  },
};

export default finalReportService;
