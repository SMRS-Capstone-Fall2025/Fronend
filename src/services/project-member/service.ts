import { apiClient } from "@/lib/api/mutator";
import type {
  InviteMemberRequestDto,
  InviteMemberResponse,
  InviteMemberResponseDto,
  InviteProjectMembersResult,
  ProjectInvitation,
  ProjectMemberActionResult,
  ProjectMemberListResponse,
  ProjectMemberResponseDto,
  ProjectMemberResponseEnvelope,
} from "../types";

const normalizeInvitation = (
  invitation: ProjectMemberResponseDto
): ProjectInvitation | null => {
  const id = invitation.id;
  if (id == null) return null;

  return {
    id,
    projectId: invitation.projectId ?? null,
    projectName: invitation.projectName ?? "Dự án chưa có tên",
    projectDescription: invitation.projectDescription ?? null,
    projectType: invitation.projectType ?? null,
    projectStatus: invitation.projectStatus ?? null,
    memberRole: invitation.memberRole ?? null,
    status: invitation.status ?? null,
    ownerName: invitation.ownerName ?? null,
    ownerEmail: invitation.ownerEmail ?? null,
    createDate: invitation.createDate ?? null,
    dueDate: invitation.dueDate ?? null,
  };
};

const normalizeInviteResult = (
  payload: InviteMemberResponse | undefined
): InviteProjectMembersResult => {
  const body: InviteMemberResponseDto | null = payload?.data ?? null;

  return {
    success: Boolean(payload?.success ?? body),
    message: payload?.message ?? null,
    totalInvited: Number(body?.totalInvited ?? 0),
    successCount: Number(body?.successCount ?? 0),
    failedCount: Number(body?.failedCount ?? 0),
    successEmails: body?.successEmails ?? [],
    failedEmails: body?.failedEmails ?? [],
    failedReasons: body?.failedReasons ?? [],
  };
};

export const projectMemberService = {
  async inviteMembers(
    projectId: number | string,
    payload: InviteMemberRequestDto
  ): Promise<InviteProjectMembersResult> {
    const response = await apiClient.post<InviteMemberResponse>(
      `/api/project-members/project/${projectId}/invite`,
      payload
    );
    return normalizeInviteResult(response.data);
  },

  async getMyInvitations(): Promise<ProjectInvitation[]> {
    const response = await apiClient.get<ProjectMemberListResponse>(
      "/api/project-members/invitations"
    );
    const rawInvitations = response.data?.data ?? [];
    return rawInvitations
      .map((item) => normalizeInvitation(item))
      .filter((item): item is ProjectInvitation => item != null);
  },

  async approveInvitation(
    invitationId: number | string
  ): Promise<ProjectMemberActionResult> {
    const response = await apiClient.post<ProjectMemberResponseEnvelope>(
      `/api/project-members/invitations/${invitationId}/approve`
    );
    const normalized = response.data?.data
      ? normalizeInvitation(response.data.data)
      : null;
    return normalized;
  },

  async rejectInvitation(
    invitationId: number | string
  ): Promise<ProjectMemberActionResult> {
    const response = await apiClient.post<ProjectMemberResponseEnvelope>(
      `/api/project-members/invitations/${invitationId}/cancel`
    );
    const normalized = response.data?.data
      ? normalizeInvitation(response.data.data)
      : null;
    return normalized;
  },
};
