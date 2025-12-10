import { apiClient } from "@/lib/api/mutator";
import type {
  AccountListQuery,
  AccountSearchParams,
  AccountSearchResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CreateAccountRequest,
  CreateAccountResponse,
  UpdateAccountRequest,
  UpdateAccountResponse,
} from "../types";

export const accountService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/api/accounts/login",
      payload
    );
    return response.data;
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      "/api/Account/Register",
      payload
    );
    return response.data;
  },

  async createAccount(
    payload: CreateAccountRequest
  ): Promise<CreateAccountResponse> {
    const response = await apiClient.post<CreateAccountResponse>(
      "/api/accounts/create",
      payload
    );
    return response.data;
  },

  async importAccounts(file: File): Promise<unknown> {
    const form = new FormData();
    form.append("file", file, file.name);

    const response = await apiClient.post<unknown>(
      "/api/accounts/import",
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async listAccounts(
    params: AccountListQuery = {}
  ): Promise<import("../types").AccountSearchResponse> {
    const { page = 1, size = 10, name, email, role, status } = params;
    const normalizedStatus = status?.trim()
      ? status.trim().toUpperCase()
      : undefined;

    const response = await apiClient.get<unknown>("/api/accounts", {
      params: {
        page,
        size,
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(email?.trim() ? { email: email.trim() } : {}),
        ...(role?.trim() ? { role: role.trim() } : {}),
        ...(normalizedStatus ? { status: normalizedStatus } : {}),
      },
    });

    const raw = response.data ?? {};

    const normalized: import("../types").AccountSearchResponse = {
      message: raw.message ?? null,
      data: {
        totalItems: raw.totalElements ?? raw.totalItems ?? 0,
        page: raw.currentPages ?? raw.page ?? page,
        pageSize: raw.pageSizes ?? raw.pageSize ?? size,
        items: raw.data ?? raw.items ?? [],
      },
    };

    return normalized;
  },

  async search(params?: AccountSearchParams): Promise<AccountSearchResponse> {
    const keyword = params?.keyword?.trim() ?? "";
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;

    const response = await apiClient.get<AccountSearchResponse>(
      "/api/Account/SearchAccounts",
      {
        params: {
          keyword: keyword || undefined,
          page,
          pageSize,
        },
      }
    );

    return response.data;
  },

  async getMe(): Promise<import("../types").MeResponse> {
    const response = await apiClient.get<import("../types").MeResponse>(
      "/api/accounts/me"
    );
    return response.data;
  },

  async changePassword(
    payload: import("../types").ChangePasswordRequest
  ): Promise<unknown> {
    const response = await apiClient.post<unknown>(
      "/api/accounts/change-password",
      payload
    );
    return response.data;
  },

  async forgotPassword(email: string): Promise<unknown> {
    const payload = { email };
    const response = await apiClient.post<unknown>(
      "/api/accounts/forgot-password",
      payload
    );
    return response.data;
  },

  async lockAccount(id: number): Promise<unknown> {
    const response = await apiClient.patch<unknown>(`/api/accounts/${id}/lock`);
    return response.data;
  },

  async activateAccount(id: number): Promise<unknown> {
    const response = await apiClient.patch<unknown>(
      `/api/accounts/${id}/activate`
    );
    return response.data;
  },

  async updateAccount(
    payload: UpdateAccountRequest
  ): Promise<UpdateAccountResponse> {
    const response = await apiClient.put<UpdateAccountResponse>(
      "/api/accounts/update",
      payload
    );
    return response.data;
  },
};
