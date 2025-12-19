import { apiClient } from "@/lib/api/mutator";
import { getErrorMessage } from "@/lib/utils";
import type {
  AssignCouncilRequest,
  CouncilDetailResponse,
  CouncilDto,
  CouncilListResponse,
  CouncilMemberDto,
  CouncilPageResponse,
  CreateCouncilRequest,
  CreateCouncilWithProjectRequest,
  DeanDecisionRequest,
  GetAllCouncilsQueryParams,
  UpdateCouncilRequest,
} from "@/services/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeCouncilMember = (value: unknown): CouncilMemberDto => {
  if (!isRecord(value)) {
    return {
      id: null,
      lecturerId: null,
      lecturerName: null,
      lecturerEmail: null,
      role: null,
      status: null,
    };
  }

  const id = Number(value.id);
  const lecturerId = Number(value.lecturerId ?? value.memberId);

  return {
    id: Number.isFinite(id) ? id : null,
    lecturerId: Number.isFinite(lecturerId) ? lecturerId : null,
    lecturerName:
      typeof value.lecturerName === "string"
        ? value.lecturerName
        : typeof value.name === "string"
        ? value.name
        : null,
    lecturerEmail:
      typeof value.lecturerEmail === "string"
        ? value.lecturerEmail
        : typeof value.email === "string"
        ? value.email
        : null,
    role: typeof value.role === "string" ? value.role : null,
    status: typeof value.status === "string" ? value.status : null,
  };
};

const normalizeCouncil = (value: unknown): CouncilDto => {
  if (!isRecord(value)) {
    return {
      id: 0,
      councilCode: null,
      councilName: null,
      department: null,
      description: null,
      status: null,
      createdAt: null,
      deanId: null,
      deanName: null,
      deanEmail: null,
      members: [],
    };
  }

  const id = Number(value.id);
  const deanId = Number(value.deanId ?? value.deanAccountId);

  const membersSource = Array.isArray(value.members) ? value.members : [];
  const members = membersSource.map(normalizeCouncilMember);

  return {
    id: Number.isFinite(id) ? id : 0,
    councilCode:
      typeof value.councilCode === "string" ? value.councilCode : null,
    councilName:
      typeof value.councilName === "string" ? value.councilName : null,
    department: typeof value.department === "string" ? value.department : null,
    description:
      typeof value.description === "string" ? value.description : null,
    status: typeof value.status === "string" ? value.status : null,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : null,
    deanId: Number.isFinite(deanId) ? deanId : null,
    deanName: typeof value.deanName === "string" ? value.deanName : null,
    deanEmail: typeof value.deanEmail === "string" ? value.deanEmail : null,
    members,
  };
};

const unwrapList = (payload: unknown): CouncilDto[] => {
  if (!isRecord(payload)) return [];

  const data = payload.data;
  if (Array.isArray(data)) {
    return data.map((item) => normalizeCouncil(item));
  }

  if (Array.isArray(payload.items)) {
    return payload.items.map((item) => normalizeCouncil(item));
  }

  return [];
};

const unwrapCouncil = (payload: unknown): CouncilDto | null => {
  if (!isRecord(payload)) return null;

  const source = isRecord(payload.data) ? payload.data : payload;
  const council = normalizeCouncil(source);

  if (
    council.id === 0 &&
    !council.councilCode &&
    !council.councilName &&
    council.members.length === 0
  ) {
    return null;
  }

  return council;
};

export const councilService = {
  async listMy(): Promise<CouncilDto[]> {
    const response = await apiClient.get<
      CouncilListResponse | Record<string, unknown>
    >("/api/councils/my-joined-councils");
    return unwrapList(response?.data ?? null);
  },

  async getList(): Promise<CouncilDto[]> {
    const response = await apiClient.get<
      CouncilListResponse | Record<string, unknown>
    >("/api/councils/my-councils");
    return unwrapList(response?.data ?? null);
  },

  async getDetail(id: number): Promise<CouncilDto | null> {
    if (!Number.isFinite(id)) return null;
    const response = await apiClient.get<
      CouncilDetailResponse | Record<string, unknown>
    >(`/api/councils/${id}`);
    const council = unwrapCouncil(response?.data ?? null);
    return council;
  },

  async create(payload: CreateCouncilRequest): Promise<CouncilDto> {
    const response = await apiClient.post<
      CouncilDetailResponse | Record<string, unknown>
    >("/api/councils", payload);
    const council = unwrapCouncil(response?.data ?? null);

    if (!council) {
      throw new Error(getErrorMessage(response?.data ?? null));
    }
    return council;
  },

  async createWithProject(
    payload: CreateCouncilWithProjectRequest
  ): Promise<CouncilDto> {
    const response = await apiClient.post<
      CouncilDetailResponse | Record<string, unknown>
    >("/api/councils/create-with-project", payload);
    const council = unwrapCouncil(response?.data ?? null);

    if (!council) {
      throw new Error(getErrorMessage(response?.data ?? null));
    }
    return council;
  },

  async update(id: number, payload: UpdateCouncilRequest): Promise<CouncilDto> {
    const response = await apiClient.put<
      CouncilDetailResponse | Record<string, unknown>
    >(`/api/councils/${id}`, payload);
    const council = unwrapCouncil(response?.data ?? null);
    if (!council) {
      throw new Error(getErrorMessage(response?.data ?? null));
    }
    return council;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/councils/${id}`);
  },

  async assignProject(
    projectId: number,
    body: AssignCouncilRequest
  ): Promise<void> {
    await apiClient.post(
      `/api/councils/${body.councilId}/assign-project/${projectId}`
    );
  },

  async makeDecision(
    projectId: number,
    body: DeanDecisionRequest
  ): Promise<void> {
    await apiClient.post(`/api/councils/projects/${projectId}/decision`, body);
  },

  async removeMember(councilId: number, lecturerId: number): Promise<void> {
    await apiClient.delete(`/api/councils/${councilId}/members/${lecturerId}`);
  },

  async getAll(
    params?: GetAllCouncilsQueryParams
  ): Promise<CouncilPageResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.size) {
      queryParams.append("size", params.size.toString());
    }
    if (params?.name) {
      queryParams.append("name", params.name);
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.deanId) {
      queryParams.append("deanId", params.deanId.toString());
    }

    const queryString = queryParams.toString();
    const url = `/api/councils/all${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<
      CouncilPageResponse | Record<string, unknown>
    >(url);

    if (!isRecord(response?.data)) {
      const emptyResponse: CouncilPageResponse = {
        success: false,
        message: null,
        data: {
          currentPages: 1,
          pageSizes: 10,
          totalPages: 0,
          totalElements: 0,
          data: [],
        },
      };
      return emptyResponse;
    }

    const payload = response.data as CouncilPageResponse;
    const pageData = isRecord(payload.data) ? payload.data : {};

    const result: CouncilPageResponse = {
      success: payload.success ?? true,
      message: payload.message ?? null,
      data: {
        currentPages: Number(pageData.currentPages) || 1,
        pageSizes: Number(pageData.pageSizes) || 10,
        totalPages: Number(pageData.totalPages) || 0,
        totalElements: Number(pageData.totalElements) || 0,
        data: Array.isArray(pageData.data)
          ? pageData.data.map((item) => normalizeCouncil(item))
          : [],
      },
    };
    return result;
  },
};

export default councilService;
