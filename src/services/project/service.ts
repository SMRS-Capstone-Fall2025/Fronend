import { apiClient } from "@/lib/api/mutator";
import type {
  MentoringProjectsResponse,
  PickProjectRequest,
  PickProjectResponse,
  ProjectCreateRequest,
  ProjectCreateResponse,
  ProjectDetailResponseDto,
  ProjectImportResponse,
  ProjectListQuery,
  ProjectListResponse,
  ProjectsReadyForCouncilResponse,
  RejectProjectRequest,
  ResubmitProjectRequest,
  UpdateProjectStatusRequest,
} from "../types";
import type { ProjectDetailResponse } from "../types";

export const projectService = {
  async getProjects(params?: ProjectListQuery): Promise<ProjectListResponse> {
    const response = await apiClient.get<ProjectListResponse>("/api/projects", {
      params,
    });
    return response.data;
  },

  async createProject(
    payload: ProjectCreateRequest
  ): Promise<ProjectCreateResponse> {
    const response = await apiClient.post<ProjectCreateResponse>(
      "/api/projects",
      payload
    );
    return response.data;
  },

  async importProjects(file: File): Promise<ProjectImportResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ProjectImportResponse>(
      "/api/projects/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async getProjectDetail(
    id: number | string
  ): Promise<ProjectDetailResponseDto | null> {
    const response = await apiClient.get<ProjectDetailResponse>(
      `/api/projects/${id}`
    );
    return response.data?.data ?? null;
  },

  async updateProjectStatus(
    id: number,
    payload: UpdateProjectStatusRequest
  ): Promise<void> {
    await apiClient.patch(`/api/projects/${id}/status`, payload);
  },

  async getMentoringProjects(): Promise<MentoringProjectsResponse> {
    const response = await apiClient.get<MentoringProjectsResponse>(
      "/api/projects/mentoring"
    );
    return response.data;
  },

  async pickProject(
    id: number,
    payload: PickProjectRequest
  ): Promise<PickProjectResponse> {
    const response = await apiClient.post<PickProjectResponse>(
      `/api/projects/${id}/pick`,
      payload
    );
    return response.data;
  },

  async getProjectsReadyForCouncil(): Promise<ProjectsReadyForCouncilResponse> {
    const response = await apiClient.get<ProjectsReadyForCouncilResponse>(
      "/api/councils/projects-ready-for-council"
    );
    return response.data;
  },

  async rejectProject(
    id: number,
    payload: RejectProjectRequest
  ): Promise<void> {
    await apiClient.post(`/api/projects/${id}/reject`, payload);
  },

  async resubmitProject(
    id: number,
    payload: ResubmitProjectRequest
  ): Promise<void> {
    await apiClient.post(`/api/projects/${id}/resubmit`, payload);
  },
};
