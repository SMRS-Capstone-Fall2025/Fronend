import type { ApiResponse, PaginatedResult } from "../common";

export type TaskStatus = "TO_DO" | "IN_PROGRESS" | "DONE";

export interface TaskDto {
  readonly id: number;
  readonly name: string;
  readonly description?: string | null;
  readonly createdBy?: { readonly id: number; readonly name?: string } | null;
  readonly assignedTo?: { readonly id: number; readonly name?: string } | null;
  readonly startDate?: string | null;
  readonly deadline?: string | null;
  readonly progressPercent?: number | null;
  readonly status?: TaskStatus | null;
  readonly milestoneId?: number | null;
  readonly milestoneName?: string | null;
}

export type TaskPageResponse = ApiResponse<PaginatedResult<TaskDto>>;

export type CreateTaskRequest = {
  readonly projectId: number;
  readonly name: string;
  readonly description?: string | null;
  readonly assignedToId?: number | null;
  readonly milestoneId?: number | null;
  readonly deadline?: string | null;
};

export type UpdateTaskRequest = Partial<CreateTaskRequest> & {
  readonly id: number;
  readonly progressPercent?: number | null;
  readonly status?: TaskStatus | null;
};
