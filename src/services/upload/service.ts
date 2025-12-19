import { apiClient } from "@/lib/api/mutator";
import type { UploadResponse, UploadResult } from "../types";

const formFieldName = "file";

const normalizeUploadResponse = (payload?: UploadResponse): UploadResponse => {
  const envelope: UploadResponse = payload ?? {};
  const rawData = envelope.data;

  if (!rawData) {
    return { ...envelope, data: undefined };
  }

  let url: string | null = null;
  let path: string | null = null;

  if (typeof rawData === "string") {
    url = rawData;
    path = rawData;
  } else if (typeof rawData === "object") {
    url = rawData.url ?? null;
    path = rawData.path ?? null;
  }

  const hasData = Boolean(url ?? path);

  const result: UploadResult | undefined = hasData
    ? {
        ...(url ? { url } : {}),
        ...(path ? { path } : {}),
      }
    : undefined;

  return {
    ...envelope,
    data: result,
  };
};

const postUpload = async (
  endpoint: string,
  file: File
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append(formFieldName, file);

  const response = await apiClient.post<UploadResponse>(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizeUploadResponse(response.data);
};

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    return postUpload("/api/upload/image", file);
  },

  async uploadFile(file: File): Promise<UploadResponse> {
    return postUpload("/api/upload/file", file);
  },
};
