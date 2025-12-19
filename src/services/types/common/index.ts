export interface ApiResponse<T> {
  readonly message?: string | null;
  readonly data: T;
}

export interface PaginationInfo {
  readonly pageNumber?: number;
  readonly pageSize?: number;
  readonly totalElements?: number;
  readonly totalPages?: number;
  readonly first?: boolean;
  readonly last?: boolean;
  readonly empty?: boolean;
}

export interface ApiEnvelope<T> {
  readonly success?: boolean;
  readonly message?: string | null;
  readonly data?: T;
  readonly pagination?: PaginationInfo | null;
}

export type VoidResponse = ApiEnvelope<Record<string, unknown> | null>;

export interface PaginatedResult<T> {
  readonly totalItems: number;
  readonly page: number;
  readonly pageSize: number;
  readonly items: T[];
}
