import { apiClient } from "@/lib/api/mutator";
import type {
  MilestoneCreateRequest,
  MilestoneDto,
  MilestoneResponseDto,
  MilestoneUpdateRequest,
  MilestoneStatusApi,
  MilestoneSubmitReportRequest,
} from "@/services/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isMilestoneStatus = (value: unknown): value is MilestoneStatusApi =>
  typeof value === "string" && value.length > 0;

const toMilestoneDto = (raw: unknown): MilestoneDto => {
  const value = isRecord(raw) ? raw : {};

  const id = Number(value.id);
  const description =
    typeof value.description === "string" ? value.description : null;
  const status = isMilestoneStatus(value.status) ? value.status : null;
  const progress = Number(value.progressPercent);
  const createDate =
    typeof value.createDate === "string" ? value.createDate : null;
  const dueDate = typeof value.dueDate === "string" ? value.dueDate : null;
  const projectId = Number(value.projectId);
  const createById = Number(value.createById);
  const reportUrl =
    typeof value.reportUrl === "string" && value.reportUrl.length > 0
      ? value.reportUrl
      : null;
  const reportSubmittedAt =
    typeof value.reportSubmittedAt === "string"
      ? value.reportSubmittedAt
      : null;
  const reportSubmittedById = Number(value.reportSubmittedById);
  const reportSubmittedByName =
    typeof value.reportSubmittedByName === "string"
      ? value.reportSubmittedByName
      : null;
  const reportComment =
    typeof value.reportComment === "string" && value.reportComment.length > 0
      ? value.reportComment
      : null;
  const isFinal =
    typeof value.isFinal === "boolean"
      ? value.isFinal
      : value.isFinal != null
      ? Boolean(value.isFinal)
      : false;

  return {
    id: Number.isFinite(id) ? id : 0,
    description,
    status,
    progressPercent: Number.isFinite(progress) ? progress : null,
    createdAt: createDate,
    dueDate,
    projectId: Number.isFinite(projectId) ? projectId : null,
    createById: Number.isFinite(createById) ? createById : null,
    isFinal,
    reportUrl,
    reportSubmittedAt,
    reportSubmittedById: Number.isFinite(reportSubmittedById)
      ? reportSubmittedById
      : null,
    reportSubmittedByName,
    reportComment,
  } satisfies MilestoneDto;
};

const toRequestBody = (
  payload: MilestoneCreateRequest | MilestoneUpdateRequest
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  if ("projectId" in payload) {
    body.projectId = payload.projectId;
  }

  if ("createById" in payload && payload.createById != null) {
    body.createById = payload.createById;
  }

  if (payload.description != null) {
    body.description = payload.description;
  }

  if (payload.dueDate != null) {
    body.dueDate = payload.dueDate;
  }

  if ("isFinal" in payload && payload.isFinal != null) {
    body.isFinal = Boolean(payload.isFinal);
  }

  if ("status" in payload && payload.status != null) {
    body.status = payload.status;
  }

  if (
    "progressPercent" in payload &&
    payload.progressPercent != null &&
    Number.isFinite(Number(payload.progressPercent))
  ) {
    body.progressPercent = payload.progressPercent;
  }

  return body;
};

export const milestoneService = {
  async listByProject(projectId: number): Promise<MilestoneDto[]> {
    const response = await apiClient.get(
      `/api/milestones/project/${projectId}`
    );
    const data = Array.isArray(response?.data) ? response.data : [];
    return data.map((item) => toMilestoneDto(item as MilestoneResponseDto));
  },

  async get(id: number): Promise<MilestoneDto> {
    const response = await apiClient.get(`/api/milestones/${id}`);
    return toMilestoneDto(response?.data as MilestoneResponseDto);
  },

  async create(payload: MilestoneCreateRequest): Promise<MilestoneDto> {
    const body = toRequestBody(payload);
    const response = await apiClient.post("/api/milestones", body);
    return toMilestoneDto(response?.data as MilestoneResponseDto);
  },

  async update(
    id: number,
    payload: MilestoneUpdateRequest
  ): Promise<MilestoneDto> {
    const body = toRequestBody(payload);
    const response = await apiClient.put(`/api/milestones/${id}`, body);
    return toMilestoneDto(response?.data as MilestoneResponseDto);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/milestones/${id}`);
  },

  async submitReport(
    id: number,
    payload: MilestoneSubmitReportRequest
  ): Promise<MilestoneDto> {
    const body: Record<string, unknown> = {};
    if (typeof payload.reportUrl === "string") {
      const trimmed = payload.reportUrl.trim();
      if (trimmed.length > 0) {
        body.reportUrl = trimmed;
      }
    }
    if (typeof payload.reportComment === "string") {
      const trimmed = payload.reportComment.trim();
      if (trimmed.length > 0) {
        body.reportComment = trimmed;
      }
    }

    const response = await apiClient.post(
      `/api/milestones/${id}/submit-report`,
      body
    );
    return toMilestoneDto(response?.data as MilestoneResponseDto);
  },
};

export default milestoneService;
