import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Simple axios instance. Set OPENAPI_BASE_URL in your environment or .env for requests that
// use a baseURL. Orval will pass `baseURL` to the mutator when configured in the generator.
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || undefined,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export type MutatorOptions = {
  url: string;
  method?: string;
  body?: any;
  // Orval often uses `data` property for request body — accept it too
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export const mutator = async <T = any>(args: any): Promise<T> => {
  // Orval may call the mutator with either:
  // 1) { url, method, body, params, headers, signal }
  // 2) { baseURL, url, options: { method, body, params, headers, signal } }

  const baseURL: string | undefined = args.baseURL ?? args.baseUrl ?? undefined;
  const url: string = args.url;
  const opts = args.options ?? args;

  const requestUrl = baseURL ? `${baseURL}${url}` : url;

  // prefer `data` (used by axios/Orval) but fall back to `body`
  const payload = opts?.data ?? opts?.body;

  // ensure header exists and default to JSON when sending a payload
  const headers = { ...(opts?.headers ?? {}) } as Record<string, string>;
  if (
    payload !== undefined &&
    !Object.keys(headers).some((k) => k.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
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
