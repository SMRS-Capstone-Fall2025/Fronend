import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CreatePublicationRequest,
  ProjectPublicationDto,
  UpdatePublicationRequest,
} from "../types";
import { publicationService } from "./service";

const publicationsKey = ["publications"] as const;

export const publicationQueryKeys = {
  all: publicationsKey,
  lists: {
    all: () => [...publicationsKey, "list"] as const,
    my: () => [...publicationsKey, "list", "my"] as const,
    byProject: (projectId: number) =>
      [...publicationsKey, "list", "project", projectId] as const,
  },
  detail: (id: number | null | undefined) =>
    [...publicationsKey, "detail", id ?? null] as const,
};

export const useAllPublicationsQuery = (
  options?: Omit<
    UseQueryOptions<ProjectPublicationDto[], Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ProjectPublicationDto[], Error>({
    queryKey: publicationQueryKeys.lists.all(),
    queryFn: () => publicationService.getAllPublications(),
    ...options,
  });

export const useMyPublicationsQuery = (
  options?: Omit<
    UseQueryOptions<ProjectPublicationDto[], Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ProjectPublicationDto[], Error>({
    queryKey: publicationQueryKeys.lists.my(),
    queryFn: () => publicationService.getMyPublications(),
    ...options,
  });

export const usePublicationsByProjectQuery = (
  projectId: number | null | undefined,
  options?: Omit<
    UseQueryOptions<ProjectPublicationDto[], Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ProjectPublicationDto[], Error>({
    queryKey: publicationQueryKeys.lists.byProject(projectId ?? 0),
    queryFn: () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      return publicationService.getPublicationsByProject(projectId);
    },
    enabled: projectId != null,
    ...options,
  });

export const usePublicationDetailQuery = (
  id: number | null | undefined,
  options?: Omit<
    UseQueryOptions<ProjectPublicationDto | null, Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ProjectPublicationDto | null, Error>({
    queryKey: publicationQueryKeys.detail(id),
    queryFn: () => {
      if (id == null) {
        throw new Error("Publication ID is required");
      }
      return publicationService.getPublicationById(id);
    },
    enabled: id != null,
    ...options,
  });

export const useCreatePublicationMutation = (
  options?: UseMutationOptions<
    ProjectPublicationDto,
    Error,
    CreatePublicationRequest
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<ProjectPublicationDto, Error, CreatePublicationRequest>({
    mutationFn: publicationService.createPublication,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: publicationQueryKeys.lists.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: publicationQueryKeys.lists.my(),
        }),
        queryClient.invalidateQueries({
          queryKey: publicationQueryKeys.lists.byProject(variables.projectId),
        }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useUpdatePublicationMutation = (
  options?: UseMutationOptions<
    ProjectPublicationDto,
    Error,
    { readonly id: number; readonly payload: UpdatePublicationRequest }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ProjectPublicationDto,
    Error,
    { readonly id: number; readonly payload: UpdatePublicationRequest }
  >({
    mutationFn: ({ id, payload }) =>
      publicationService.updatePublication(id, payload),
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: publicationQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: publicationQueryKeys.detail(variables.id),
        }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useDeletePublicationMutation = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => publicationService.deletePublication(id),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: publicationQueryKeys.all,
      });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

