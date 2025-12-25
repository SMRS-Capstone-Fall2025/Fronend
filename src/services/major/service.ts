import { apiClient } from "@/lib/api/mutator";
import type {
  LecturerDto,
  LecturerListResponse,
  MajorListResponse,
  MajorListResult,
} from "../types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeLecturer = (value: unknown): LecturerDto => {
  if (!isRecord(value)) {
    return {
      id: null,
      name: null,
      email: null,
      phone: null,
      avatar: null,
      degree: null,
      yearsExperience: null,
      majorId: null,
      majorName: null,
    };
  }

  const id = Number(value.id);
  const majorId = Number(value.majorId);
  const yearsExperience = Number(value.yearsExperience);
  return {
    id: Number.isFinite(id) ? id : null,
    name: typeof value.name === "string" ? value.name : null,
    email: typeof value.email === "string" ? value.email : null,
    phone: typeof value.phone === "string" ? value.phone : null,
    avatar: typeof value.avatar === "string" ? value.avatar : null,
    degree: typeof value.degree === "string" ? value.degree : null,
    yearsExperience: Number.isFinite(yearsExperience) ? yearsExperience : null,
    majorId: Number.isFinite(majorId) ? majorId : null,
    majorName: typeof value.majorName === "string" ? value.majorName : null,
  };
};

const unwrapLecturerList = (payload: unknown): LecturerDto[] => {
  if (!isRecord(payload)) return [];

  const data = payload.data;
  if (Array.isArray(data)) {
    return data.map((item) => normalizeLecturer(item));
  }

  return [];
};

export const majorService = {
  async list(): Promise<MajorListResult> {
    const response = await apiClient.get<MajorListResponse>("/api/majors");
    const data = response.data?.data ?? [];
    return {
      majors: Array.isArray(data) ? data : [],
      pagination: response.data?.pagination ?? null,
      message: response.data?.message,
    };
  },

  async getLecturersByMajor(majorId: number): Promise<LecturerDto[]> {
    if (!Number.isFinite(majorId)) return [];
    const response = await apiClient.get<LecturerListResponse>(
      `/api/majors/${majorId}/lecturers`
    );
    return unwrapLecturerList(response?.data ?? null);
  },
};
