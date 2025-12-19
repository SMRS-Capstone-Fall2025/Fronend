import type { ApiEnvelope } from "../common";

export interface InviteMemberRequestDto {
  readonly emails: string[];
}

export interface InviteMemberResponseDto {
  readonly totalInvited?: number;
  readonly successCount?: number;
  readonly failedCount?: number;
  readonly successEmails?: string[];
  readonly failedEmails?: string[];
  readonly failedReasons?: string[];
}

export type InviteMemberResponse = ApiEnvelope<InviteMemberResponseDto>;

export type ProjectMemberStatusApi =
  | "Pending"
  | "InReview"
  | "Approved"
  | "Rejected"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export interface ProjectMemberResponseDto {
  readonly id?: number;
  readonly projectId?: number;
  readonly projectName?: string | null;
  readonly projectDescription?: string | null;
  readonly projectType?: string | null;
  readonly projectStatus?: ProjectMemberStatusApi | null;
  readonly memberRole?: string | null;
  readonly status?: string | null;
  readonly ownerName?: string | null;
  readonly ownerEmail?: string | null;
  readonly createDate?: string | null;
  readonly dueDate?: string | null;
}

export type ProjectMemberResponseEnvelope =
  ApiEnvelope<ProjectMemberResponseDto>;

export type ProjectMemberListResponse = ApiEnvelope<ProjectMemberResponseDto[]>;

export interface ProjectInvitation {
  readonly id: number;
  readonly projectId: number | null;
  readonly projectName: string;
  readonly projectDescription: string | null;
  readonly projectType: string | null;
  readonly projectStatus: ProjectMemberStatusApi | null;
  readonly memberRole: string | null;
  readonly status: string | null;
  readonly ownerName: string | null;
  readonly ownerEmail: string | null;
  readonly createDate: string | null;
  readonly dueDate: string | null;
}

export interface InviteProjectMembersResult {
  readonly success: boolean;
  readonly message: string | null;
  readonly totalInvited: number;
  readonly successCount: number;
  readonly failedCount: number;
  readonly successEmails: readonly string[];
  readonly failedEmails: readonly string[];
  readonly failedReasons: readonly string[];
}

export type ProjectMemberActionResult = ProjectInvitation | null;
