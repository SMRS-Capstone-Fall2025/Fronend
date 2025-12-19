import { apiClient } from "@/lib/api/mutator";
import type {
  CreatePublicationRequest,
  ProjectPublicationDto,
  PublicationListResponse,
  PublicationResponse,
  UpdatePublicationRequest,
} from "../types";

export const publicationService = {
  async getAllPublications(): Promise<ProjectPublicationDto[]> {
    const response = await apiClient.get<PublicationListResponse>(
      "/api/publications"
    );
    return response.data?.data ?? [];
  },

  async getMyPublications(): Promise<ProjectPublicationDto[]> {
    const response = await apiClient.get<PublicationListResponse>(
      "/api/publications/my"
    );
    return response.data?.data ?? [];
  },

  async getPublicationsByProject(
    projectId: number
  ): Promise<ProjectPublicationDto[]> {
    const response = await apiClient.get<PublicationListResponse>(
      `/api/publications/project/${projectId}`
    );
    return response.data?.data ?? [];
  },

  async getPublicationById(id: number): Promise<ProjectPublicationDto | null> {
    const response = await apiClient.get<PublicationResponse>(
      `/api/publications/${id}`
    );
    return response.data?.data ?? null;
  },

  async createPublication(
    payload: CreatePublicationRequest
  ): Promise<ProjectPublicationDto> {
    const response = await apiClient.post<PublicationResponse>(
      "/api/publications",
      payload
    );
    if (!response.data?.data) {
      throw new Error("Failed to create publication");
    }
    return response.data.data;
  },

  async updatePublication(
    id: number,
    payload: UpdatePublicationRequest
  ): Promise<ProjectPublicationDto> {
    const response = await apiClient.put<PublicationResponse>(
      `/api/publications/${id}`,
      payload
    );
    if (!response.data?.data) {
      throw new Error("Failed to update publication");
    }
    return response.data.data;
  },

  async deletePublication(id: number): Promise<void> {
    await apiClient.delete(`/api/publications/${id}`);
  },
};

