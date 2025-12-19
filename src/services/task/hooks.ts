import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import type {
  TaskDto,
  TaskPageResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/services/types/task";
import { taskService, type TaskListParams } from "./service";

const tasksKey = ["tasks"] as const;

export const taskQueryKeys = {
  all: tasksKey,
  list: (params?: TaskListParams) => [...tasksKey, "list", params] as const,
  item: (id: number) => [...tasksKey, "item", id] as const,
};

export type TasksListParams = TaskListParams;

export const useTasksListQuery = (
  params?: TasksListParams,
  options?: Partial<
    UseQueryOptions<TaskPageResponse, Error, TaskPageResponse, QueryKey>
  >
) => {
  const projectIdSource = params?.projectId;
  let projectId: number | string | null = null;

  if (typeof projectIdSource === "number" && Number.isFinite(projectIdSource)) {
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

  const normalized: TaskListParams = {
    page: params?.page ?? 1,
    size: params?.size ?? 10,
    status: params?.status ?? null,
    projectId,
  };

  const config: UseQueryOptions<
    TaskPageResponse,
    Error,
    TaskPageResponse,
    QueryKey
  > = {
    queryKey: taskQueryKeys.list(normalized) as unknown as QueryKey,
    queryFn: () => taskService.list(normalized),
  };

  if (options) Object.assign(config, options);

  return useQuery<TaskPageResponse, Error, TaskPageResponse>(config);
};

export const useTaskQuery = (
  id: number | null,
  options?: UseQueryOptions<TaskDto, Error, TaskDto>
) => {
  const config: UseQueryOptions<TaskDto, Error, TaskDto> = {
    enabled: id != null,
    queryKey:
      id != null
        ? (taskQueryKeys.item(id) as unknown as QueryKey)
        : (["tasks", "item", "idle"] as unknown as QueryKey),
    queryFn: () =>
      id != null ? taskService.get(id) : Promise.reject(new Error("no id")),
  };

  if (options) Object.assign(config, options);

  return useQuery<TaskDto, Error, TaskDto>(config);
};

export const useCreateTaskMutation = (
  options?: UseMutationOptions<TaskDto, Error, CreateTaskRequest>
) => {
  const queryClient = useQueryClient();

  const config: UseMutationOptions<TaskDto, Error, CreateTaskRequest> = {
    mutationFn: (payload: CreateTaskRequest) => taskService.create(payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      await options?.onSuccess?.(data, variables, context);
    },
  };

  if (options) Object.assign(config, options);

  return useMutation<TaskDto, Error, CreateTaskRequest>(config);
};

export const useUpdateTaskMutation = (
  options?: UseMutationOptions<TaskDto, Error, UpdateTaskRequest>
) => {
  const queryClient = useQueryClient();

  const config: UseMutationOptions<TaskDto, Error, UpdateTaskRequest> = {
    mutationFn: ({ id, ...payload }: UpdateTaskRequest) =>
      taskService.update(id, { id, ...payload }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      await options?.onSuccess?.(data, variables, context);
    },
  };

  if (options) Object.assign(config, options);

  return useMutation<TaskDto, Error, UpdateTaskRequest>(config);
};

export const useDeleteTaskMutation = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  const config: UseMutationOptions<void, Error, number> = {
    mutationFn: (id: number) => taskService.remove(id),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      await options?.onSuccess?.(data, variables, context);
    },
  };

  if (options) Object.assign(config, options);

  return useMutation<void, Error, number>(config);
};

export const useAssignTaskMutation = (
  options?: UseMutationOptions<
    TaskDto,
    Error,
    { taskId: number; accountId: number }
  >
) => {
  const queryClient = useQueryClient();

  const config: UseMutationOptions<
    TaskDto,
    Error,
    { taskId: number; accountId: number }
  > = {
    mutationFn: ({ taskId, accountId }) =>
      taskService.assign(taskId, accountId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      await options?.onSuccess?.(data, variables, context);
    },
  };

  if (options) Object.assign(config, options);

  return useMutation<TaskDto, Error, { taskId: number; accountId: number }>(
    config
  );
};
