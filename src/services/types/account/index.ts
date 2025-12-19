import type { ApiResponse, PaginatedResult } from "../common";
import type { MajorDto } from "../major";

export interface CouncilManagerProfile {
  readonly profileId?: number | null;
  readonly employeeCode?: string | null;
  readonly positionTitle?: string | null;
  readonly department?: string | null;
  readonly status?: string | null;
}

export interface LoginRequest {
  readonly email: string;
  readonly password?: string;
}

export interface LoginPayload {
  readonly token: string;
  readonly email?: string;
  readonly role?: string;
}

export type LoginResponse = ApiResponse<LoginPayload>;

export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
}

export type RegisterResponse = ApiResponse<null>;

export interface RoleId {
  readonly id: number;
  readonly roleName: string;
}

export interface CreateAccountRequest {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly phone?: string | null;
  readonly age?: number | null;
  readonly roleId: RoleId;
}

export type CreateAccountResponse = ApiResponse<{ id: number } | null>;

export interface AccountDto {
  readonly id: number;
  readonly email: string;
  readonly fullName: string;

  readonly name?: string | null;

  readonly role?: string | RoleId;
  readonly locked?: boolean | null;
  readonly createdAt?: string;
  readonly avatar?: string | null;
  readonly phone?: string | null;
  readonly major?: MajorDto | null;
  readonly councilManagerProfile?: CouncilManagerProfile | null;
}

export interface AccountSearchParams {
  readonly keyword?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export type AccountSearchResponse = ApiResponse<PaginatedResult<AccountDto>>;

export interface AccountListQuery {
  readonly page?: number;
  readonly size?: number;
  readonly name?: string;
  readonly email?: string;
  readonly role?: string;
  readonly status?: string;
}

export interface ChangePasswordRequest {
  readonly oldPassword: string;
  readonly newPassword: string;
  readonly confirmPassword?: string | null;
}

export interface UpdateAccountRequest {
  readonly name?: string | null;
  readonly phone?: string | null;
  readonly avatar?: string | null;
}

export type UpdateAccountResponse = ApiResponse<AccountDto>;

export type MeResponse = ApiResponse<AccountDto>;
