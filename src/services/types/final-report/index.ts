import type { PaginationInfo } from "../common";

export interface FinalReportDto {
  readonly id: number;
  readonly projectId: number;
  readonly projectName: string;
  readonly submittedById: number;
  readonly submittedByName: string;
  readonly reportTitle: string;
  readonly description: string | null;
  readonly filePath: string;
  readonly fileName: string;
  readonly fileType: string;
  readonly fileSize: number;
  readonly submissionDate: string;
  readonly status: string;
  readonly version: number;
  readonly remarks: string | null;
}

export interface FinalReportListResponse {
  readonly success: boolean;
  readonly message?: string | null;
  readonly data: FinalReportDto[];
  readonly pagination?: PaginationInfo | null;
}

export type FinalReportListResult = {
  readonly reports: FinalReportDto[];
  readonly pagination: PaginationInfo | null;
  readonly message?: string | null;
};

export interface CouncilMemberDto {
  readonly councilMemberId: number;
  readonly lecturerId: number;
  readonly lecturerName: string;
  readonly lecturerEmail: string;
  readonly role: string;
  readonly hasScored: boolean;
}

export interface LecturerScoreDto {
  readonly scoreId: number;
  readonly lecturerId: number;
  readonly lecturerName: string;
  readonly lecturerEmail: string;
  readonly criteria1Score: number;
  readonly criteria2Score: number;
  readonly criteria3Score: number;
  readonly criteria4Score: number;
  readonly criteria5Score: number;
  readonly criteria6Score: number;
  readonly bonusScore1: number;
  readonly bonusScore2: number;
  readonly totalScore: number;
  readonly finalScore: number;
  readonly comment: string | null;
  readonly scoreDate: string;
}

export interface ProjectMemberDto {
  readonly projectMemberId: number;
  readonly accountId: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
}

export interface ProjectReviewDto {
  readonly projectId: number;
  readonly projectName: string;
  readonly projectDescription: string;
  readonly projectType: string;
  readonly projectStatus: string;
  readonly projectCreateDate: string;
  readonly projectDueDate: string;
  readonly ownerId: number;
  readonly ownerName: string;
  readonly ownerEmail: string;
  readonly ownerRole: string;
  readonly myRoleInProject: string;
  readonly myMemberId: number | null;
  readonly finalMilestoneId: number;
  readonly reportTitle: string;
  readonly reportDescription: string;
  readonly reportFilePath: string;
  readonly reportSubmissionDate: string;
  readonly reportSubmittedBy: string;
  readonly councilId: number;
  readonly councilName: string;
  readonly councilCode: string;
  readonly councilDepartment: string;
  readonly councilMembers: CouncilMemberDto[];
  readonly hasLecturerMentor: boolean;
  readonly lecturerMentorId: number | null;
  readonly lecturerMentorName: string | null;
  readonly lecturerMentorEmail: string | null;
  readonly lecturerMentorStatus: string | null;
  readonly hasBeenScored: boolean;
  readonly averageScore: number;
  readonly totalScores: number;
  readonly expectedTotalScores: number;
  readonly lecturerScores: LecturerScoreDto[];
  readonly totalMembers: number;
  readonly totalStudents: number;
  readonly approvedStudents: number;
  readonly pendingStudents: number;
  readonly members: ProjectMemberDto[];
}

export interface ProjectReviewListResponse {
  readonly success: boolean;
  readonly message?: string | null;
  readonly data: ProjectReviewDto[];
  readonly pagination?: PaginationInfo | null;
}

export type ProjectReviewListResult = {
  readonly projects: ProjectReviewDto[];
  readonly pagination: PaginationInfo | null;
  readonly message?: string | null;
};

export interface MentorReviewDto {
  readonly projectId: number;
  readonly projectName: string;
  readonly projectDescription: string | null;
  readonly projectType: string | null;
  readonly projectStatus: string;
  readonly projectCreateDate: string;
  readonly projectDueDate: string;
  readonly finalMilestoneId: number;
  readonly reportTitle: string;
  readonly reportDescription: string | null;
  readonly reportFilePath: string | null;
  readonly reportSubmissionDate: string | null;
  readonly reportSubmittedBy: string | null;
  readonly councilId: number;
  readonly councilName: string;
  readonly councilCode: string;
  readonly councilDepartment: string;
  readonly hasScored: boolean;
  readonly myScoreId: number | null;
  readonly myFinalScore: number | null;
  readonly currentAverage: number | null;
  readonly totalScores: number;
  readonly totalCouncilMembers: number;
  readonly ownerId: number;
  readonly ownerName: string;
  readonly ownerEmail: string;
  readonly ownerRole: string;
  readonly totalMembers: number;
  readonly totalStudents: number;
  readonly hasLecturer: boolean;
  readonly isCheck: boolean;
}

export interface MentorReviewListResponse {
  readonly success: boolean;
  readonly message?: string | null;
  readonly data: MentorReviewDto[];
  readonly pagination?: PaginationInfo | null;
}

export type MentorReviewListResult = {
  readonly projects: MentorReviewDto[];
  readonly pagination: PaginationInfo | null;
  readonly message?: string | null;
};
