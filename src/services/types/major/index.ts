import type { ApiEnvelope, PaginationInfo } from "../common";

export interface MajorDto {
  readonly id?: number;
  readonly name?: string | null;
  readonly code?: string | null;
  readonly description?: string | null;
  readonly isActive?: boolean | null;
}

export type MajorListResponse = ApiEnvelope<MajorDto[]>;

export interface MajorListResult {
  readonly majors: MajorDto[];
  readonly pagination: PaginationInfo | null;
  readonly message?: string | null;
}

export interface LecturerDto {
  readonly id?: number | null;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly avatar?: string | null;
  readonly degree?: string | null;
  readonly yearsExperience?: number | null;
  readonly majorId?: number | null;
  readonly majorName?: string | null;
}

export type LecturerListResponse = ApiEnvelope<LecturerDto[]>;
