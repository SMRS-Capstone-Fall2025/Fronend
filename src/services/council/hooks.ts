import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CouncilDto,
  CouncilPageResponse,
  CreateCouncilRequest,
  CreateCouncilWithProjectRequest,
  DeanDecisionRequest,
  GetAllCouncilsQueryParams,
  UpdateCouncilRequest,
} from "@/services/types";
import { projectQueryKeys } from "../project/hooks";
import { councilService } from "./service";

const councilKey = ["councils"] as const;

export const councilQueryKeys = {
  all: councilKey,
  mine: () => [...councilKey, "mine"] as const,
  list: () => [...councilKey, "list"] as const,
  allPaginated: (params?: GetAllCouncilsQueryParams) =>
    [...councilKey, "all", params] as const,
  detail: (id: number | null | undefined) =>
    [...councilKey, "detail", id ?? "unknown"] as const,
};

export const useMyCouncilsQuery = (
  options?: UseQueryOptions<CouncilDto[], Error>
) =>
  useQuery<CouncilDto[], Error>({
    queryKey: councilQueryKeys.mine(),
    queryFn: () => councilService.listMy(),
    staleTime: 60_000,
    ...options,
  });

export const useCouncilListQuery = (
  options?: UseQueryOptions<CouncilDto[], Error>
) =>
  useQuery<CouncilDto[], Error>({
    queryKey: councilQueryKeys.list(),
    queryFn: () => councilService.getList(),
    staleTime: 60_000,
    ...options,
  });

export const useCouncilDetailQuery = (
  id: number | null,
  options?: UseQueryOptions<CouncilDto | null, Error>
) =>
  useQuery<CouncilDto | null, Error>({
    queryKey: councilQueryKeys.detail(id),
    enabled: id != null,
    queryFn: () => councilService.getDetail(id ?? 0),
    staleTime: 30_000,
    ...options,
  });

export const useCreateCouncilMutation = (
  options?: UseMutationOptions<CouncilDto, Error, CreateCouncilRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<CouncilDto, Error, CreateCouncilRequest>({
    mutationFn: (payload) => councilService.create(payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: councilKey });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useCreateCouncilWithProjectMutation = (
  options?: UseMutationOptions<
    CouncilDto,
    Error,
    CreateCouncilWithProjectRequest
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<CouncilDto, Error, CreateCouncilWithProjectRequest>({
    mutationFn: (payload) => councilService.createWithProject(payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: councilKey });
      await queryClient.invalidateQueries({
        queryKey: projectQueryKeys.readyForCouncil(),
      });
      await queryClient.invalidateQueries({
        queryKey: projectQueryKeys.detail(variables.projectId),
      });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useUpdateCouncilMutation = (
  options?: UseMutationOptions<CouncilDto, Error, UpdateCouncilRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<CouncilDto, Error, UpdateCouncilRequest>({
    mutationFn: ({ id, ...payload }) =>
      councilService.update(id, { id, ...payload }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: councilKey });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useDeleteCouncilMutation = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id: number) => councilService.remove(id),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: councilKey });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useAssignCouncilMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    { projectId: number; councilId: number }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { projectId: number; councilId: number }>({
    mutationFn: ({ projectId, councilId }) =>
      councilService.assignProject(projectId, { councilId }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: councilKey });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useDeanDecisionMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    { projectId: number; body: DeanDecisionRequest }
  >
) =>
  useMutation<void, Error, { projectId: number; body: DeanDecisionRequest }>({
    mutationFn: ({ projectId, body }) =>
      councilService.makeDecision(projectId, body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: options?.onSettled,
  });

export const useRemoveMemberFromCouncilMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    { councilId: number; lecturerId: number }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { councilId: number; lecturerId: number }>({
    mutationFn: ({ councilId, lecturerId }) =>
      councilService.removeMember(councilId, lecturerId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: councilKey });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useAllCouncilsQuery = (
  params?: GetAllCouncilsQueryParams,
  options?: UseQueryOptions<CouncilPageResponse, Error>
) =>
  useQuery<CouncilPageResponse, Error>({
    queryKey: councilQueryKeys.allPaginated(params),
    queryFn: () => councilService.getAll(params),
    staleTime: 30_000,
    ...options,
  });
