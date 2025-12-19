import type { ApiResponse, PaginationInfo } from "../common";

export interface GradingCriterion {
  readonly id: number;
  readonly name: string;
  readonly maxScore: number;
  readonly description?: string | null;
}

export interface GradingRubric {
  readonly id: number;
  readonly name: string;
  readonly description?: string | null;
  readonly criteria: GradingCriterion[];
  readonly totalScore: number;
}

export interface GradeSubmission {
  readonly milestoneId: number;
  readonly scores: Array<{
    readonly criterionId: number;
    readonly score: number;
  }>;
  readonly totalScore: number;
  readonly feedback?: string | null;
  readonly gradedAt?: string | null;
}

export interface GradeResponse {
  readonly id: number;
  readonly milestoneId: number;
  readonly gradedById: number;
  readonly gradedByName?: string | null;
  readonly totalScore: number;
  readonly feedback?: string | null;
  readonly gradedAt: string;
  readonly scores: Array<{
    readonly criterionId: number;
    readonly criterionName: string;
    readonly score: number;
    readonly maxScore: number;
  }>;
}

export type GradeSubmissionResponse = ApiResponse<GradeResponse>;

export interface ProjectScoreCreateDto {
  readonly projectId: number;
  readonly finalReportId: number;
  readonly criteria1Score?: number;
  readonly criteria2Score?: number;
  readonly criteria3Score?: number;
  readonly criteria4Score?: number;
  readonly criteria5Score?: number;
  readonly criteria6Score?: number;
  readonly bonusScore1?: number;
  readonly bonusScore2?: number;
  readonly comment?: string | null;
}

export interface ProjectScoreUpdateDto {
  readonly criteria1Score?: number;
  readonly criteria2Score?: number;
  readonly criteria3Score?: number;
  readonly criteria4Score?: number;
  readonly criteria5Score?: number;
  readonly criteria6Score?: number;
  readonly bonusScore1?: number;
  readonly bonusScore2?: number;
  readonly comment?: string | null;
}

export interface ProjectScoreResponseDto {
  readonly id: number;
  readonly projectId: number;
  readonly projectName: string;
  readonly finalMilestoneId: number;
  readonly reportFilePath: string;
  readonly reportSubmissionDate: string;
  readonly reportSubmittedBy: string;
  readonly lecturerId: number;
  readonly lecturerName: string;
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
  readonly comment?: string | null;
  readonly scoreDate: string;
}

export interface ProjectScoreListResponse {
  readonly success: boolean;
  readonly message?: string | null;
  readonly data: ProjectScoreResponseDto[];
  readonly pagination?: PaginationInfo | null;
}

export interface ProjectScoreResponse {
  readonly success: boolean;
  readonly message?: string | null;
  readonly data: ProjectScoreResponseDto;
  readonly pagination?: PaginationInfo | null;
}

export const DEFAULT_GRADING_RUBRIC: GradingRubric = {
  id: 1,
  name: "Phiếu đánh giá đề tài nghiên cứu khoa học của sinh viên",
  description: "Đánh giá theo tiêu chí của Trường Đại học Lạc Hồng Khoa",
  totalScore: 100,
  criteria: [
    {
      id: 1,
      name: "Tổng quan tính hình nghiên cứu, lý do chọn đề tài",
      maxScore: 10,
    },
    {
      id: 2,
      name: "Mục tiêu đề tài",
      maxScore: 10,
    },
    {
      id: 3,
      name: "Phương pháp nghiên cứu",
      maxScore: 15,
    },
    {
      id: 4,
      name: "Nội dung khoa học",
      maxScore: 30,
    },
    {
      id: 5,
      name: "Đóng góp về mặt kinh tế - xã hội, giáo dục và đào tạo",
      maxScore: 15,
    },
    {
      id: 6,
      name: "Hình thức trình bày báo cáo tổng kết đề tài",
      maxScore: 10,
    },
    {
      id: 7,
      name: "Điểm Bonus",
      maxScore: 10,
      description:
        "Có công bố khoa học từ kết quả nghiên cứu của đề tài trên các tạp chí chuyên ngành trong và ngoài nước hoặc hợp đồng triển khai tại các đơn vị. Có bài báo khoa học được trình bày theo đúng mẫu của nhà trường và nội dung bài báo có hàm lượng khoa học cao.",
    },
  ],
};
