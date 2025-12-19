import type { ApiEnvelope } from "../common";

export type CouncilStatus =
  | "Draft"
  | "Pending"
  | "Active"
  | "Inactive"
  | "Archived"
  | string;

export interface CouncilMemberDto {
  readonly id?: number | null;
  readonly lecturerId?: number | null;
  readonly lecturerName?: string | null;
  readonly lecturerEmail?: string | null;
  readonly role?: string | null;
  readonly status?: string | null;
}

export interface CouncilDto {
  readonly id: number;
  readonly councilCode?: string | null;
  readonly councilName?: string | null;
  readonly department?: string | null;
  readonly description?: string | null;
  readonly status?: CouncilStatus | null;
  readonly createdAt?: string | null;
  readonly deanId?: number | null;
  readonly deanName?: string | null;
  readonly deanEmail?: string | null;
  readonly members: CouncilMemberDto[];
}

export type CouncilListResponse = ApiEnvelope<CouncilDto[]>;

export type CouncilDetailResponse = ApiEnvelope<CouncilDto>;

export interface CreateCouncilRequest {
  readonly councilCode: string;
  readonly councilName: string;
  readonly department?: string | null;
  readonly description?: string | null;
  readonly lecturerEmails?: string[];
  readonly lecturerIds?: number[];
}

export interface CreateCouncilWithProjectRequest {
  readonly projectId: number;
  readonly councilCode: string;
  readonly councilName: string;
  readonly department?: string | null;
  readonly description?: string | null;
  readonly lecturerEmails?: string[];
}

export interface UpdateCouncilRequest {
  readonly id: number;
  readonly councilCode?: string;
  readonly councilName?: string;
  readonly department?: string | null;
  readonly description?: string | null;
  readonly status?: CouncilStatus | null;
  readonly lecturerEmails?: string[];
  readonly lecturerIds?: number[];
}

export interface AssignCouncilRequest {
  readonly councilId: number;
}

export interface DeanDecisionRequest {
  readonly decision: string;
  readonly comment?: string | null;
}

export interface GetAllCouncilsQueryParams {
  readonly page?: number;
  readonly size?: number;
  readonly name?: string;
  readonly status?: "ACTIVE" | "INACTIVE" | string;
  readonly deanId?: number;
}

export interface PageResponseCouncilResponse {
  readonly currentPages?: number;
  readonly pageSizes?: number;
  readonly totalPages?: number;
  readonly totalElements?: number;
  readonly data?: CouncilDto[];
}

export type CouncilPageResponse = ApiEnvelope<PageResponseCouncilResponse>;
