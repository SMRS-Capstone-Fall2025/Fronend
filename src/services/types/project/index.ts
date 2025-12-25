import type { ApiEnvelope, PaginationInfo, VoidResponse } from "../common";

export type ProjectStatusApi =
  | "Pending"
  | "InReview"
  | "Approved"
  | "Rejected"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "Archived"
  | "RevisionRequired"
  | "Scored";

export interface ProjectListQuery {
  readonly page?: number;
  readonly size?: number;
  readonly sortBy?: string;
  readonly sortDir?: string;
  readonly name?: string;
  readonly status?: ProjectStatusApi | null;
  readonly ownerId?: number | string;
  readonly isMine?: boolean;
  readonly hasFinalReport?: boolean;
  readonly majorId?: number;
}

export interface ProjectStudentDto {
  readonly projectMemberId?: number;
  readonly accountId?: number;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly status?: string | null;
}

export interface ProjectMentorDto {
  readonly projectMemberId?: number;
  readonly accountId?: number;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly status?: string | null;
}

export interface ProjectListItemDto {
  readonly id?: number;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly type?: string | null;
  readonly dueDate?: string | null;
  readonly ownerId?: number | null;
  readonly ownerName?: string | null;
  readonly ownerEmail?: string | null;
  readonly ownerRole?: string | null;
  readonly status?: ProjectStatusApi | null;
  readonly mentor?: ProjectMentorDto | null;
  readonly students?: ProjectStudentDto[] | null;
  readonly hasFinalReport?: boolean;
  readonly majorId?: number | null;
  readonly isCreatedByDean?: boolean;
  readonly rejectionReason?: string | null;
  readonly rejectionFeedback?: string | null;
  readonly revisionDeadline?: string | null;
}

export interface ProjectListResponse {
  readonly content?: ProjectListItemDto[];
  readonly totalPages?: number;
  readonly totalElements?: number;
  readonly number?: number;
  readonly size?: number;
  readonly numberOfElements?: number;
  readonly first?: boolean;
  readonly last?: boolean;
  readonly empty?: boolean;
}

export interface ProjectReadyForCouncilDto {
  readonly projectId: number;
  readonly projectName: string;
  readonly projectDescription: string | null;
  readonly projectType: string | null;
  readonly projectStatus: string;
  readonly projectCreateDate: string;
  readonly projectDueDate: string | null;
  readonly ownerId: number;
  readonly ownerName: string;
  readonly ownerEmail: string;
  readonly ownerRole: string;
  readonly majorId: number | null;
  readonly majorName: string | null;
  readonly hasFinalReport: boolean;
  readonly finalMilestoneId: number | null;
  readonly reportUrl: string | null;
  readonly reportSubmittedAt: string | null;
  readonly reportSubmittedBy: string | null;
  readonly alreadyAssignedToCouncil: boolean;
  readonly assignedCouncilId: number | null;
  readonly assignedCouncilName: string | null;
  readonly assignedCouncilCode: string | null;
}

export interface ProjectsReadyForCouncilResponse {
  readonly success: boolean;
  readonly message: string | null;
  readonly data: ProjectReadyForCouncilDto[];
  readonly pagination: unknown | null;
}

export interface ProjectFileDto {
  readonly filePath: string;
  readonly type: string;
  readonly fileType?: string;
}

export interface ProjectImageDto {
  readonly url: string;
}

export interface ProjectCreateRequest {
  readonly name: string;
  readonly description?: string | null;
  readonly type?: string | null;
  readonly dueDate?: string | null;
  readonly majorId?: number;
  readonly files?: ProjectFileDto[];
  readonly images?: ProjectImageDto[];
  readonly invitedEmails?: string[] | null;
}

export type ProjectCreateResponse = VoidResponse;
export type ProjectImportResponse = VoidResponse;

export interface ProjectMemberDetailDto {
  readonly id?: number;
  readonly accountId?: number;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly role?: string | null;
  readonly status?: string | null;
  readonly joinedDate?: string | null;
}

export interface ProjectOwnerDto {
  readonly id?: number;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly role?: string | null;
}

export interface ProjectLecturerDto {
  readonly id?: number;
  readonly accountId?: number;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly status?: string | null;
}

export interface ProjectFileInfoDto {
  readonly id?: number;
  readonly filePath?: string | null;
  readonly type?: string | null;
}

export interface ProjectImageInfoDto {
  readonly id?: number;
  readonly url?: string | null;
}

export interface ProjectStatisticsDto {
  readonly totalMembers?: number;
  readonly approvedMembers?: number;
  readonly pendingMembers?: number;
  readonly totalStudents?: number;
  readonly totalFiles?: number;
  readonly totalImages?: number;
  readonly hasLecturer?: boolean;
}

export interface ProjectDetailResponseDto {
  readonly id?: number;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly type?: string | null;
  readonly status?: ProjectStatusApi | null;
  readonly createDate?: string | null;
  readonly dueDate?: string | null;
  readonly owner?: ProjectOwnerDto | null;
  readonly lecturer?: ProjectLecturerDto | null;
  readonly members?: ProjectMemberDetailDto[];
  readonly files?: ProjectFileInfoDto[];
  readonly images?: ProjectImageInfoDto[];
  readonly statistics?: ProjectStatisticsDto | null;
  readonly rejectionReason?: string | null;
  readonly rejectionFeedback?: string | null;
  readonly revisionDeadline?: string | null;
}

export type ProjectDetailResponse = ApiEnvelope<ProjectDetailResponseDto>;

export interface UpdateProjectStatusRequest {
  readonly status: ProjectStatusApi;
  readonly note?: string | null;
}

export interface RejectProjectRequest {
  readonly reason?: string | null;
  readonly feedback?: string | null;
  readonly rejectType: "REVISION" | "PERMANENT";
  readonly revisionDays?: number | null;
}

export interface PickProjectRequest {
  readonly description?: string | null;
  readonly majorId?: number | null;
  readonly files?: Array<{
    readonly filePath: string;
    readonly type?: string | null;
  }> | null;
  readonly images?: Array<{
    readonly url: string;
  }> | null;
}

export interface ResubmitProjectRequest {
  readonly description?: string | null;
  readonly majorId?: number | null;
  readonly files?: Array<{
    readonly filePath: string;
    readonly type?: string | null;
  }> | null;
  readonly images?: Array<{
    readonly url: string;
  }> | null;
}

export type PickProjectResponse = ProjectDetailResponse;

export interface StudentInfo {
  readonly projectMemberId?: number;
  readonly accountId?: number;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly status?: string | null;
}

export interface MentoringProjectDto {
  readonly projectId?: number;
  readonly projectName?: string | null;
  readonly projectDescription?: string | null;
  readonly projectType?: string | null;
  readonly projectStatus?: string | null;
  readonly projectCreateDate?: string | null;
  readonly projectDueDate?: string | null;
  readonly ownerId?: number;
  readonly ownerName?: string | null;
  readonly ownerEmail?: string | null;
  readonly ownerRole?: string | null;
  readonly majorId?: number;
  readonly majorName?: string | null;
  readonly projectMemberId?: number;
  readonly mentoringStatus?: string | null;
  readonly students?: StudentInfo[] | null;
  readonly totalStudents?: number;
  readonly approvedStudents?: number;
  readonly pendingStudents?: number;
  readonly totalMilestones?: number;
  readonly completedMilestones?: number;
}

export interface MentoringProjectsResponse {
  readonly success?: boolean;
  readonly message?: string | null;
  readonly data?: MentoringProjectDto[];
  readonly pagination?: PaginationInfo | null;
}
