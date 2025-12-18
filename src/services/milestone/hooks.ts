import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  MilestoneCreateRequest,
  MilestoneDto,
  MilestoneSubmitReportRequest,
  MilestoneUpdateRequest,
} from "@/services/types";
import { milestoneService } from "./service";

const milestonesKey = ["milestones"] as const;

export const milestoneQueryKeys = {
  all: milestonesKey,
  listByProject: (projectId: number | null) =>
    [...milestonesKey, "project", projectId ?? "unknown"] as const,
  item: (id: number) => [...milestonesKey, "item", id] as const,
};

export const useProjectMilestonesQuery = (
  projectId: number | null,
  options?: Partial<UseQueryOptions<MilestoneDto[] | undefined, Error, MilestoneDto[]>>
) => {
  const enabled = projectId != null;

  const config: UseQueryOptions<
    MilestoneDto[] | undefined,
    Error,
    MilestoneDto[]
  > = {
    enabled,
    queryKey: milestoneQueryKeys.listByProject(
      projectId
    ) as unknown as QueryKey,
    queryFn: () =>
      enabled
        ? milestoneService.listByProject(projectId as number)
        : Promise.resolve([]),
    select: (data) => data ?? [],
  };

  if (options) Object.assign(config, options);

  return useQuery<MilestoneDto[] | undefined, Error, MilestoneDto[]>(config);
};

export const useMilestoneQuery = (
  id: number | null,
  options?: UseQueryOptions<MilestoneDto, Error, MilestoneDto>
) => {
  const enabled = id != null;

  const config: UseQueryOptions<MilestoneDto, Error, MilestoneDto> = {
    enabled,
    queryKey: enabled
      ? (milestoneQueryKeys.item(id as number) as unknown as QueryKey)
      : ([...milestonesKey, "item", "idle"] as unknown as QueryKey),
    queryFn: () =>
      enabled
        ? milestoneService.get(id as number)
        : Promise.reject(new Error("no milestone id")),
  };

  if (options) Object.assign(config, options);

  return useQuery<MilestoneDto, Error, MilestoneDto>(config);
};

export const useCreateMilestoneMutation = (
  options?: UseMutationOptions<MilestoneDto, Error, MilestoneCreateRequest>
) => {
  const queryClient = useQueryClient();

  const config: UseMutationOptions<
    MilestoneDto,
    Error,
    MilestoneCreateRequest
  > = {
    mutationFn: (payload) => milestoneService.create(payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: milestoneQueryKeys.listByProject(
          variables.projectId
        ) as unknown as QueryKey,
      });
      await options?.onSuccess?.(data, variables, context);
    },
  };

  if (options) Object.assign(config, options);

  return useMutation<MilestoneDto, Error, MilestoneCreateRequest>(config);
};

export const useUpdateMilestoneMutation = (
  options?: UseMutationOptions<
    MilestoneDto,
    Error,
    {
      readonly id: number;
      readonly payload: MilestoneUpdateRequest;
      readonly projectId?: number | null;
    }
  >
) => {
  const queryClient = useQueryClient();

  const config: UseMutationOptions<
    MilestoneDto,
    Error,
    {
      readonly id: number;
      readonly payload: MilestoneUpdateRequest;
      readonly projectId?: number | null;
    }
  > = {
    mutationFn: ({ id, payload }) => milestoneService.update(id, payload),
    onSuccess: async (data, variables, context) => {
      const projectId = variables.projectId ?? data.projectId;
      if (projectId != null) {
        await queryClient.invalidateQueries({
          queryKey: milestoneQueryKeys.listByProject(
            projectId
          ) as unknown as QueryKey,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: milestoneQueryKeys.item(variables.id) as unknown as QueryKey,
      });
      await options?.onSuccess?.(data, variables, context);
    },
  };

  if (options) Object.assign(config, options);

  return useMutation<
    MilestoneDto,
    Error,
    {
      readonly id: number;
      readonly payload: MilestoneUpdateRequest;
      readonly projectId?: number | null;
    }
  >(config);
};

export const useDeleteMilestoneMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    { readonly id: number; readonly projectId?: number | null }
  >
) => {
  const queryClient = useQueryClient();

  const config: UseMutationOptions<
    void,
    Error,
    { readonly id: number; readonly projectId?: number | null }
  > = {
    mutationFn: ({ id }) => milestoneService.remove(id),
    onSuccess: async (_data, variables, context) => {
      if (variables.projectId != null) {
        await queryClient.invalidateQueries({
          queryKey: milestoneQueryKeys.listByProject(
            variables.projectId
          ) as unknown as QueryKey,
        });
      }
      await options?.onSuccess?.(_data, variables, context);
    },
  };

  if (options) Object.assign(config, options);

  return useMutation<
    void,
    Error,
    { readonly id: number; readonly projectId?: number | null }
  >(config);
};

export const useSubmitMilestoneReportMutation = (
  options?: UseMutationOptions<
    MilestoneDto,
    Error,
    {
      readonly id: number;
      readonly payload: MilestoneSubmitReportRequest;
      readonly projectId?: number | null;
    }
  >
) => {
  const queryClient = useQueryClient();

  const config: UseMutationOptions<
    MilestoneDto,
    Error,
    {
      readonly id: number;
      readonly payload: MilestoneSubmitReportRequest;
      readonly projectId?: number | null;
    }
  > = {
    mutationFn: ({ id, payload }) => milestoneService.submitReport(id, payload),
    onSuccess: async (data, variables, context) => {
      const projectId = variables.projectId ?? data.projectId;
      if (projectId != null) {
        await queryClient.invalidateQueries({
          queryKey: milestoneQueryKeys.listByProject(
            projectId
          ) as unknown as QueryKey,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: milestoneQueryKeys.item(variables.id) as unknown as QueryKey,
      });
      await options?.onSuccess?.(data, variables, context);
    },
  };

  if (options) Object.assign(config, options);

  return useMutation<
    MilestoneDto,
    Error,
    {
      readonly id: number;
      readonly payload: MilestoneSubmitReportRequest;
      readonly projectId?: number | null;
    }
  >(config);
};
