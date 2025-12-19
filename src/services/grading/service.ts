import { apiClient } from "@/lib/api/mutator";
import type {
  GradeSubmission,
  GradeSubmissionResponse,
  GradeResponse,
  ProjectScoreCreateDto,
  ProjectScoreUpdateDto,
  ProjectScoreResponseDto,
  ProjectScoreResponse,
  ProjectScoreListResponse,
} from "../types";

export const gradingService = {

  async submitGrade(
    reportId: number,
    payload: GradeSubmission
  ): Promise<GradeResponse> {
    const response = await apiClient.post<GradeSubmissionResponse>(
      `/api/final-reports/${reportId}/grade`,
      payload
    );

    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }

    return response.data.data;
  },

  async getGrade(reportId: number): Promise<GradeResponse | null> {
    try {
      const response = await apiClient.get<GradeSubmissionResponse>(
        `/api/final-reports/${reportId}/grade`
      );
      return response.data?.data ?? null;
    } catch (error: unknown) {

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response?.status === "number" &&
        (error as { response: { status: number } }).response.status === 404
      ) {
        return null;
      }
      throw error;
    }
  },

  async createProjectScore(
    payload: ProjectScoreCreateDto
  ): Promise<ProjectScoreResponseDto> {
    const response = await apiClient.post<ProjectScoreResponse>(
      "/api/project-scores",
      payload
    );

    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }

    return response.data.data;
  },

  async updateProjectScore(
    scoreId: number,
    payload: ProjectScoreUpdateDto
  ): Promise<ProjectScoreResponseDto> {
    const response = await apiClient.put<ProjectScoreResponse>(
      `/api/project-scores/${scoreId}`,
      payload
    );

    if (!response.data?.data) {
      throw new Error("Invalid response from server");
    }

    return response.data.data;
  },

  async getProjectScoreByMilestone(
    finalMilestoneId: number
  ): Promise<ProjectScoreResponseDto | null> {
    try {
      const response = await apiClient.get<ProjectScoreListResponse>(
        `/api/project-scores/report/${finalMilestoneId}`
      );

      return response.data?.data?.[0] ?? null;
    } catch (error: unknown) {

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response?.status === "number" &&
        (error as { response: { status: number } }).response.status === 404
      ) {
        return null;
      }
      throw error;
    }
  },

  async getAllProjectScores(): Promise<ProjectScoreResponseDto[]> {
    const response = await apiClient.get<ProjectScoreListResponse>(
      "/api/project-scores"
    );
    return response.data?.data ?? [];
  },

  async getProjectScoresByProject(
    projectId: number
  ): Promise<ProjectScoreResponseDto[]> {
    const response = await apiClient.get<ProjectScoreListResponse>(
      `/api/project-scores/project/${projectId}`
    );
    return response.data?.data ?? [];
  },

  async getMyProjectScores(): Promise<ProjectScoreResponseDto[]> {
    const response = await apiClient.get<ProjectScoreListResponse>(
      "/api/project-scores/my-scores"
    );
    return response.data?.data ?? [];
  },
};

export default gradingService;
