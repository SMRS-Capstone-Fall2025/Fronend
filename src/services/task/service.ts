import { apiClient } from "@/lib/api/mutator";
import type {
  TaskDto,
  TaskPageResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from "@/services/types/task";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isTaskStatus = (value: unknown): value is TaskStatus =>
  value === "TO_DO" || value === "IN_PROGRESS" || value === "DONE";

const normalizeTask = (task: unknown): TaskDto => {
  if (!isRecord(task)) {
    return {
      id: 0,
      name: "",
      description: null,
      createdBy: null,
      assignedTo: null,
      startDate: null,
      deadline: null,
      progressPercent: null,
      status: null,
      milestoneId: null,
      milestoneName: null,
    };
  }

  const parseAccount = (value: unknown) => {
    if (!isRecord(value)) return null;
    const id = Number(value.id);
    if (!Number.isFinite(id)) return null;
    const name = typeof value.name === "string" ? value.name : undefined;
    return { id, name };
  };

  const id = Number(task.id);
  const name = typeof task.name === "string" ? task.name : "";
  const description =
    typeof task.description === "string" ? task.description : null;
  const startDate = typeof task.startDate === "string" ? task.startDate : null;
  const deadline = typeof task.deadline === "string" ? task.deadline : null;
  const progress = Number(task.progressPercent);
  const milestoneId = Number(task.milestoneId);
  const milestoneName =
    typeof task.milestoneName === "string" ? task.milestoneName : null;
  const statusValue = isTaskStatus(task.status) ? task.status : null;

  return {
    id: Number.isFinite(id) ? id : 0,
    name,
    description,
    createdBy: parseAccount(task.createdBy),
    assignedTo: parseAccount(task.assignedTo),
    startDate,
    deadline,
    progressPercent: Number.isFinite(progress) ? progress : null,
    status: statusValue,
    milestoneId: Number.isFinite(milestoneId) ? milestoneId : null,
    milestoneName,
  };
};

export type TaskListParams = {
  readonly page?: number;
  readonly size?: number;
  readonly status?: TaskStatus | null;
  readonly projectId?: number | string | null;
};

export const taskService = {
  async list(params: TaskListParams = {}): Promise<TaskPageResponse> {
    const page = params.page ?? 1;
    const size = params.size ?? 10;
    const status = params.status ?? null;
    const projectIdSource = params.projectId;

    let projectId: number | string | null = null;
    if (
      typeof projectIdSource === "number" &&
      Number.isFinite(projectIdSource)
    ) {
      projectId = projectIdSource;
    } else if (typeof projectIdSource === "string") {
      const trimmed = projectIdSource.trim();
      if (trimmed.length > 0) {
        const numericCandidate = Number(trimmed);
        projectId = Number.isFinite(numericCandidate)
          ? numericCandidate
          : trimmed;
      }
    }

    let endpoint = "/api/tasks";

    if (projectId != null) {
      const encodedProjectId = encodeURIComponent(String(projectId));
      if (status) {
        endpoint = `/api/tasks/project/${encodedProjectId}/status/${encodeURIComponent(
          status
        )}`;
      } else {
        endpoint = `/api/tasks/project/${encodedProjectId}`;
      }
    } else if (status) {
      endpoint = `/api/tasks/status/${encodeURIComponent(status)}`;
    }

    const response = await apiClient.get(endpoint, {
      params: { page, size },
    });

    const raw = isRecord(response?.data) ? response.data : {};
    const itemsSource = Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.content)
      ? raw.content
      : [];

    const items = itemsSource.map((item) => normalizeTask(item));

    return {
      message: typeof raw.message === "string" ? raw.message : null,
      data: {
        totalItems:
          Number(raw.totalElements ?? raw.totalItems ?? raw.total ?? 0) || 0,
        page: Number(raw.currentPages ?? raw.page ?? page) || page,
        pageSize: Number(raw.pageSizes ?? raw.pageSize ?? size) || size,
        items,
      },
    };
  },

  async get(id: number): Promise<TaskDto> {
    const response = await apiClient.get(`/api/tasks/${id}`);
    return normalizeTask(response?.data);
  },

  async create(payload: CreateTaskRequest): Promise<TaskDto> {
    const response = await apiClient.post(`/api/tasks`, payload);
    return normalizeTask(response?.data);
  },

  async update(id: number, payload: UpdateTaskRequest): Promise<TaskDto> {
    const response = await apiClient.put(`/api/tasks/${id}`, payload);
    return normalizeTask(response?.data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/tasks/${id}`);
  },

  async assign(taskId: number, accountId: number): Promise<TaskDto> {
    const response = await apiClient.put(
      `/api/tasks/${taskId}/assign/${accountId}`
    );
    return normalizeTask(response?.data);
  },
};

export default taskService;
