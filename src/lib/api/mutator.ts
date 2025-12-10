import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || undefined,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (!config.headers) {
      config.headers = {} as Record<string, string>;
    }

    const headers = config.headers as Record<string, string>;

    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export type MutatorOptions = {
  url: string;
  method?: string;
  body?: unknown;

  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type MutatorArgs =
  | (MutatorOptions & { url: string; baseURL?: string; baseUrl?: string })
  | {
      baseURL?: string;
      baseUrl?: string;
      url: string;
      options?: MutatorOptions;
    };

export const mutator = async <T = unknown>(args: MutatorArgs): Promise<T> => {

  const baseURL: string | undefined = args.baseURL ?? args.baseUrl ?? undefined;
  const url: string = args.url;

  const opts: MutatorOptions =
    "options" in args && args.options ? args.options : (args as MutatorOptions);

  const requestUrl = baseURL ? `${baseURL}${url}` : url;

  const payload = opts?.data ?? opts?.body;

  const headers = { ...(opts?.headers ?? {}) } as Record<string, string>;
  if (
    payload !== undefined &&
    !Object.keys(headers).some((k) => k.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: AxiosRequestConfig = {
    url: requestUrl,
    method: opts?.method,
    data: payload,
    params: opts?.params,
    headers,
    signal: opts?.signal,
  };

  const response = await apiClient.request<T>(config);

  return response.data;
};
