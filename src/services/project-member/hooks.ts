import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  InviteProjectMembersResult,
  ProjectInvitation,
  ProjectMemberActionResult,
} from "../types";
import { projectMemberService } from "./service";

const projectMembersKey = ["project-members"] as const;

export const projectMemberQueryKeys = {
  all: projectMembersKey,
  invitations: () => [...projectMembersKey, "invitations"] as const,
  invitation: (id: number | string | null | undefined) =>
    [...projectMembersKey, "invitation", id ?? null] as const,
};

export const useProjectInvitationsQuery = (
  options?: Omit<
    UseQueryOptions<ProjectInvitation[], Error>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ProjectInvitation[], Error>({
    queryKey: projectMemberQueryKeys.invitations(),
    queryFn: () => projectMemberService.getMyInvitations(),
    staleTime: 0,
    refetchOnMount: "always",
    ...options,
  });

type InviteProjectMembersVariables = {
  readonly projectId: number | string;
  readonly emails: string[];
};

export const useInviteProjectMembersMutation = (
  options?: UseMutationOptions<
    InviteProjectMembersResult,
    Error,
    InviteProjectMembersVariables
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation<
    InviteProjectMembersResult,
    Error,
    InviteProjectMembersVariables
  >({
    mutationFn: ({ projectId, emails }) =>
      projectMemberService.inviteMembers(projectId, { emails }),
    async onSuccess(data, variables, context) {
      await queryClient.invalidateQueries({
        queryKey: projectMemberQueryKeys.invitations(),
      });
      if (onSuccess) {
        await onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useApproveProjectInvitationMutation = (
  options?: UseMutationOptions<
    ProjectMemberActionResult,
    Error,
    number | string
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation<ProjectMemberActionResult, Error, number | string>({
    mutationFn: (invitationId) =>
      projectMemberService.approveInvitation(invitationId),
    async onSuccess(data, variables, context) {
      await queryClient.invalidateQueries({
        queryKey: projectMemberQueryKeys.invitations(),
      });
      if (onSuccess) {
        await onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useRejectProjectInvitationMutation = (
  options?: UseMutationOptions<
    ProjectMemberActionResult,
    Error,
    number | string
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation<ProjectMemberActionResult, Error, number | string>({
    mutationFn: (invitationId) =>
      projectMemberService.rejectInvitation(invitationId),
    async onSuccess(data, variables, context) {
      await queryClient.invalidateQueries({
        queryKey: projectMemberQueryKeys.invitations(),
      });
      if (onSuccess) {
        await onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
