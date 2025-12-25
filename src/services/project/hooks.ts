import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
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
import { projectService } from "./service";

const projectsKey = ["projects"] as const;

export const projectQueryKeys = {
  all: projectsKey,
  list: (params?: ProjectListQuery) =>
    [
      ...projectsKey,
      "list",
      params?.page ?? null,
      params?.size ?? null,
      params?.sortBy ?? null,
      params?.sortDir ?? null,
      params?.name ?? null,
      params?.status ?? null,
      params?.ownerId ?? null,
      params?.isMine ?? null,
      params?.majorId ?? null,
    ] as const,
  create: () => [...projectsKey, "create"] as const,
  import: () => [...projectsKey, "import"] as const,
  detail: (id: number | string | null | undefined) =>
    [...projectsKey, "detail", id ?? null] as const,
  mentoring: () => [...projectsKey, "mentoring"] as const,
  readyForCouncil: () => [...projectsKey, "ready-for-council"] as const,
};

export const useProjectsQuery = (
  params?: ProjectListQuery,
  options?: Omit<
    UseQueryOptions<ProjectListResponse, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ProjectListResponse, Error>({
    queryKey: projectQueryKeys.list(params),
    queryFn: () => projectService.getProjects(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useProjectsInfiniteQuery = (
  baseParams?: Omit<ProjectListQuery, "page" | "size">,
  options?: Omit<
    UseInfiniteQueryOptions<ProjectListResponse, Error>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) => {
  const pageSize = 10;

  return useInfiniteQuery<ProjectListResponse, Error>({
    queryKey: projectQueryKeys.list({ ...baseParams, size: pageSize }),
    queryFn: ({ pageParam = 0 }) =>
      projectService.getProjects({
        ...baseParams,
        page: pageParam as number,
        size: pageSize,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length - 1;
      const totalPages = lastPage.totalPages ?? 0;
      const hasMore = currentPage + 1 < totalPages;
      return hasMore ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    ...options,
  });
};

export const useProjectDetailQuery = (
  id: number | string | null | undefined,
  options?: Omit<
    UseQueryOptions<ProjectDetailResponseDto | null, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ProjectDetailResponseDto | null, Error>({
    queryKey: projectQueryKeys.detail(id),
    queryFn: () => {
      if (id == null) {
        throw new Error("Project ID is required");
      }
      return projectService.getProjectDetail(id);
    },
    enabled: id != null,
    staleTime: 60_000,
    ...options,
  });

export const useCreateProjectMutation = (
  options?: UseMutationOptions<
    ProjectCreateResponse,
    Error,
    ProjectCreateRequest
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<ProjectCreateResponse, Error, ProjectCreateRequest>({
    mutationKey: projectQueryKeys.create(),
    mutationFn: projectService.createProject,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useUpdateProjectStatusMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    { readonly id: number; readonly payload: UpdateProjectStatusRequest }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { readonly id: number; readonly payload: UpdateProjectStatusRequest }
  >({
    mutationFn: ({ id, payload }) =>
      projectService.updateProjectStatus(id, payload),
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(variables.id),
        }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export type ProjectImportVariables = {
  readonly file: File;
};

export const useImportProjectsMutation = (
  options?: UseMutationOptions<
    ProjectImportResponse,
    Error,
    ProjectImportVariables
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<ProjectImportResponse, Error, ProjectImportVariables>({
    mutationKey: projectQueryKeys.import(),
    mutationFn: ({ file }) => projectService.importProjects(file),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useMentoringProjectsQuery = (
  options?: Omit<
    UseQueryOptions<MentoringProjectsResponse, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<MentoringProjectsResponse, Error>({
    queryKey: projectQueryKeys.mentoring(),
    queryFn: () => projectService.getMentoringProjects(),
    ...options,
  });

export type PickProjectVariables = {
  readonly id: number;
  readonly payload: PickProjectRequest;
};

export const usePickProjectMutation = (
  options?: UseMutationOptions<PickProjectResponse, Error, PickProjectVariables>
) => {
  const queryClient = useQueryClient();

  return useMutation<PickProjectResponse, Error, PickProjectVariables>({
    mutationFn: ({ id, payload }) => projectService.pickProject(id, payload),
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(variables.id),
        }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useProjectsReadyForCouncilQuery = (
  options?: Omit<
    UseQueryOptions<ProjectsReadyForCouncilResponse, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ProjectsReadyForCouncilResponse, Error>({
    queryKey: projectQueryKeys.readyForCouncil(),
    queryFn: () => projectService.getProjectsReadyForCouncil(),
    staleTime: 30_000,
    ...options,
  });

export const useRejectProjectMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    { readonly id: number; readonly payload: RejectProjectRequest }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { readonly id: number; readonly payload: RejectProjectRequest }
  >({
    mutationFn: ({ id, payload }) => projectService.rejectProject(id, payload),
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(variables.id),
        }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useResubmitProjectMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    { readonly id: number; readonly payload: ResubmitProjectRequest }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { readonly id: number; readonly payload: ResubmitProjectRequest }
  >({
    mutationFn: ({ id, payload }) =>
      projectService.resubmitProject(id, payload),
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(variables.id),
        }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};
