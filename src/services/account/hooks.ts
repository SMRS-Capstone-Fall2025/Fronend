import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  AccountListQuery,
  AccountSearchParams,
  AccountSearchResponse,
  ChangePasswordRequest,
  CreateAccountRequest,
  CreateAccountResponse,
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateAccountRequest,
  UpdateAccountResponse,
} from "../types";
import { accountService } from "./service";

type NormalizedAccountSearchParams = {
  readonly keyword: string;
  readonly page: number;
  readonly pageSize: number;
};

const normalizeAccountSearchParams = (
  params?: AccountSearchParams
): NormalizedAccountSearchParams => ({
  keyword: params?.keyword?.trim() ?? "",
  page: params?.page ?? 1,
  pageSize: params?.pageSize ?? 10,
});

const accountsKey = ["accounts"] as const;

export const accountQueryKeys = {
  all: accountsKey,
  search: (params?: AccountSearchParams) =>
    [...accountsKey, "search", normalizeAccountSearchParams(params)] as const,
};

export const useAccountSearchQuery = (
  params?: AccountSearchParams,
  options?: UseQueryOptions<AccountSearchResponse, Error, AccountSearchResponse>
) => {
  const normalizedParams = normalizeAccountSearchParams(params);

  const config: UseQueryOptions<
    AccountSearchResponse,
    Error,
    AccountSearchResponse
  > = {
    queryKey: [...accountsKey, "search", normalizedParams] as const,
    queryFn: () => accountService.search(normalizedParams),
  };

  if (options) {
    Object.assign(config, options);
  }

  return useQuery<AccountSearchResponse, Error, AccountSearchResponse>(config);
};

export const useLoginMutation = (
  options?: UseMutationOptions<LoginResponse, Error, LoginRequest>
) => {
  const config: UseMutationOptions<LoginResponse, Error, LoginRequest> = {
    mutationFn: accountService.login,
  };

  if (options) {
    Object.assign(config, options);
  }

  return useMutation<LoginResponse, Error, LoginRequest>(config);
};

export const useRegisterMutation = (
  options?: UseMutationOptions<RegisterResponse, Error, RegisterRequest>
) => {
  const config: UseMutationOptions<RegisterResponse, Error, RegisterRequest> = {
    mutationFn: accountService.register,
  };

  if (options) {
    Object.assign(config, options);
  }

  return useMutation<RegisterResponse, Error, RegisterRequest>(config);
};

export const useCreateAccountMutation = (
  options?: UseMutationOptions<
    CreateAccountResponse,
    Error,
    CreateAccountRequest
  >
) => {
  const config: UseMutationOptions<
    CreateAccountResponse,
    Error,
    CreateAccountRequest
  > = {
    mutationFn: accountService.createAccount,
  };

  if (options) Object.assign(config, options);

  return useMutation<CreateAccountResponse, Error, CreateAccountRequest>(
    config
  );
};

export type AccountsListParams = AccountListQuery;

const normalizeAccountsListParams = (params?: AccountsListParams) => ({
  page: params?.page ?? 1,
  size: params?.size ?? 10,
  name: params?.name?.trim() ?? "",
  email: params?.email?.trim() ?? "",
  role: params?.role?.trim() ?? "",
  status: params?.status?.trim() ?? "",
});

export const accountsListKey = (params?: AccountsListParams) =>
  [...accountsKey, "list", normalizeAccountsListParams(params)] as const;

export const useAccountsListQuery = (
  params?: AccountsListParams,
  options?: UseQueryOptions<AccountSearchResponse, Error, AccountSearchResponse>
) => {
  const normalized = normalizeAccountsListParams(params);

  const config: UseQueryOptions<
    AccountSearchResponse,
    Error,
    AccountSearchResponse
  > = {
    queryKey: accountsListKey(normalized) as QueryKey,
    queryFn: () => accountService.listAccounts(normalized),
  };

  if (options) Object.assign(config, options);

  return useQuery<AccountSearchResponse, Error, AccountSearchResponse>(config);
};

export type ImportAccountsVariables = {
  readonly file: File;
};

export const useImportAccountsMutation = (
  options?: UseMutationOptions<unknown, Error, ImportAccountsVariables>
) => {
  const config: UseMutationOptions<unknown, Error, ImportAccountsVariables> = {
    mutationFn: async ({ file }) => accountService.importAccounts(file),
  };

  if (options) Object.assign(config, options);

  return useMutation<unknown, Error, ImportAccountsVariables>(config);
};

export const useLockAccountMutation = (
  options?: UseMutationOptions<unknown, Error, number>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation<unknown, Error, number>({
    mutationFn: (id: number) => accountService.lockAccount(id),
    async onSuccess(data, variables, context) {
      await queryClient.invalidateQueries({ queryKey: accountsKey });
      if (onSuccess) {
        await onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useActivateAccountMutation = (
  options?: UseMutationOptions<unknown, Error, number>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation<unknown, Error, number>({
    mutationFn: (id: number) => accountService.activateAccount(id),
    async onSuccess(data, variables, context) {
      await queryClient.invalidateQueries({ queryKey: accountsKey });
      if (onSuccess) {
        await onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useForgotPasswordMutation = (
  options?: UseMutationOptions<unknown, Error, { email: string }>
) => {
  const config: UseMutationOptions<unknown, Error, { email: string }> = {
    mutationFn: async ({ email }) => accountService.forgotPassword(email),
  };

  if (options) Object.assign(config, options);

  return useMutation<unknown, Error, { email: string }>(config);
};

type MeQueryOptions = Omit<
  UseQueryOptions<MeResponse, Error>,
  "queryKey" | "queryFn"
>;

export const useMeQuery = (options?: MeQueryOptions) => {
  const config: UseQueryOptions<MeResponse, Error> = {
    queryKey: [...accountsKey, "me"] as const,
    queryFn: () => accountService.getMe(),
  };

  if (options) {
    Object.assign(config, options);
  }

  return useQuery<MeResponse, Error>(config);
};

export const useChangePasswordMutation = (
  options?: UseMutationOptions<unknown, Error, ChangePasswordRequest>
) => {
  const config: UseMutationOptions<unknown, Error, ChangePasswordRequest> = {
    mutationFn: (payload) => accountService.changePassword(payload),
  };

  if (options) Object.assign(config, options);

  return useMutation<unknown, Error, ChangePasswordRequest>(config);
};

export const useUpdateAccountMutation = (
  options?: UseMutationOptions<
    UpdateAccountResponse,
    Error,
    UpdateAccountRequest
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation<UpdateAccountResponse, Error, UpdateAccountRequest>({
    mutationFn: (payload) => accountService.updateAccount(payload),
    async onSuccess(data, variables, context) {
      await queryClient.invalidateQueries({ queryKey: [...accountsKey, "me"] });
      if (onSuccess) {
        await onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
