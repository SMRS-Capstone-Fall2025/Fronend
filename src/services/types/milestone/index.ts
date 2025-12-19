import type { ApiResponse } from "../common";

export type MilestoneStatusApi =
  | "Pending"
  | "InProgress"
  | "Completed"
  | "Delayed"
  | "Cancelled"
  | string;

export interface MilestoneResponseDto {
  readonly id?: number | null;
  readonly description?: string | null;
  readonly status?: MilestoneStatusApi | null;
  readonly progressPercent?: number | null;
  readonly createDate?: string | null;
  readonly dueDate?: string | null;
  readonly projectId?: number | null;
  readonly createById?: number | null;
  readonly isFinal?: boolean | null;
  readonly reportUrl?: string | null;
  readonly reportSubmittedAt?: string | null;
  readonly reportSubmittedById?: number | null;
  readonly reportSubmittedByName?: string | null;
  readonly reportComment?: string | null;
}

export interface MilestoneDto {
  readonly id: number;
  readonly description: string | null;
  readonly status: MilestoneStatusApi | null;
  readonly progressPercent: number | null;
  readonly createdAt: string | null;
  readonly dueDate: string | null;
  readonly projectId: number | null;
  readonly createById: number | null;
  readonly isFinal: boolean;
  readonly reportUrl: string | null;
  readonly reportSubmittedAt: string | null;
  readonly reportSubmittedById: number | null;
  readonly reportSubmittedByName: string | null;
  readonly reportComment: string | null;
}

export interface MilestoneCreateRequest {
  readonly projectId: number;
  readonly description: string;
  readonly dueDate?: string | null;
  readonly createById?: number | null;
  readonly isFinal?: boolean | null;
}

export type MilestoneCreateResponse = ApiResponse<MilestoneResponseDto | null>;

export interface MilestoneUpdateRequest {
  readonly description?: string | null;
  readonly dueDate?: string | null;
  readonly status?: MilestoneStatusApi | null;
  readonly progressPercent?: number | null;
  readonly isFinal?: boolean | null;
}

export type MilestoneUpdateResponse = ApiResponse<MilestoneResponseDto | null>;

export interface MilestoneSubmitReportRequest {
  readonly reportUrl?: string | null;
  readonly reportComment?: string | null;
}
