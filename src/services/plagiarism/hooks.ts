import { apiClient } from "@/lib/api/mutator";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { UploadResponse } from "../types";
import type {
  PlagiarismCheckRequest,
  PlagiarismCheckResult,
} from "../types/plagiarism";
import { uploadService } from "../upload/service";

const extractUploadUrl = (response?: UploadResponse | null): string | null => {
  if (!response?.data) return null;
  if (typeof response.data === "string") {
    return response.data;
  }
  return response.data.url ?? response.data.path ?? null;
};

const base64ToFile = (base64: string, fileName: string): File => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray]);
  return new File([blob], fileName, { type: blob.type });
};

export function useCheckPlagiarismMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PlagiarismCheckRequest) => {
      let fileUrl: string;

      // Nếu đã có reportFilePath (URL), dùng trực tiếp
      if (request.reportFilePath) {
        fileUrl = request.reportFilePath;
      }
      // Nếu có fileBase64, upload file trước để lấy URL
      else if (request.fileBase64 && request.fileName) {
        const file = base64ToFile(request.fileBase64, request.fileName);
        const uploadResponse = await uploadService.uploadFile(file);
        const uploadedUrl = extractUploadUrl(uploadResponse);
        if (!uploadedUrl) {
          throw new Error("Không thể lấy URL sau khi upload file.");
        }
        fileUrl = uploadedUrl;
      } else {
        throw new Error(
          "Thiếu thông tin file: cần có reportFilePath hoặc fileBase64 với fileName."
        );
      }

      // Gửi URL xuống API plagiarism
      const response = await apiClient.post<PlagiarismCheckResult>(
        `/api/plagiarism/submit-url/${request.reportId}`,
        {
          url: fileUrl,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["plagiarism", data.reportId],
      });
    },
  });
}

export function usePlagiarismResultQuery(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _reportId: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _scanId?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options?: {
    enabled?: boolean;
  }
) {
  return {
    data: null as PlagiarismCheckResult | null,
    isLoading: false,
    error: null,
  };
}

export interface SubmitPlagiarismReportRequest {
  readonly scanId: string;
  readonly status: "completed" | "failed";
  readonly url: string;
}

export interface SubmitPlagiarismUrlRequest {
  readonly scanId: string;
  readonly url: string;
}

export function useSubmitPlagiarismUrlMutation(
  options?: UseMutationOptions<void, Error, SubmitPlagiarismUrlRequest>
) {
  return useMutation<void, Error, SubmitPlagiarismUrlRequest>({
    mutationFn: async ({ scanId, url }) => {
      await apiClient.post(`/api/plagiarism/submit-url/${scanId}`, {
        url,
      });
    },
    ...options,
  });
}

export const plagiarismResultQueryKeys = {
  all: ["plagiarism-results"] as const,
  byScanId: (scanId: string | number | null) =>
    ["plagiarism-results", "scan", scanId ?? "unknown"] as const,
};

export function usePlagiarismResultByScanIdQuery(
  scanId: string | number | null,
  options?: {
    enabled?: boolean;
  } & Omit<
    UseQueryOptions<
      unknown,
      Error,
      unknown,
      ReturnType<typeof plagiarismResultQueryKeys.byScanId>
    >,
    "queryKey" | "queryFn" | "enabled"
  >
) {
  return useQuery({
    queryKey: plagiarismResultQueryKeys.byScanId(scanId),
    queryFn: async () => {
      if (!scanId) throw new Error("scanId is required");
      const response = await apiClient.get(`/api/plagiarism/result/${scanId}`);
      return response.data;
    },
    enabled: scanId != null && (options?.enabled ?? true),
    ...options,
  });
}
