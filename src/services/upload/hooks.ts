import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { UploadResponse } from "../types";
import { uploadService } from "./service";

const uploadKeys = ["upload"] as const;

export const uploadQueryKeys = {
  all: uploadKeys,
  image: () => [...uploadKeys, "image"] as const,
  file: () => [...uploadKeys, "file"] as const,
};

export type UploadImageVariables = {
  readonly file: File;
};

export type UploadFileVariables = {
  readonly file: File;
};

export const useUploadImageMutation = (
  options?: UseMutationOptions<UploadResponse, Error, UploadImageVariables>
) => {
  const config: UseMutationOptions<
    UploadResponse,
    Error,
    UploadImageVariables
  > = {
    mutationKey: uploadQueryKeys.image(),
    mutationFn: async ({ file }) => uploadService.uploadImage(file),
  };

  if (options) {
    Object.assign(config, options);
  }

  return useMutation<UploadResponse, Error, UploadImageVariables>(config);
};

export const useUploadFileMutation = (
  options?: UseMutationOptions<UploadResponse, Error, UploadFileVariables>
) => {
  const config: UseMutationOptions<UploadResponse, Error, UploadFileVariables> =
    {
      mutationKey: uploadQueryKeys.file(),
      mutationFn: async ({ file }) => uploadService.uploadFile(file),
    };

  if (options) {
    Object.assign(config, options);
  }

  return useMutation<UploadResponse, Error, UploadFileVariables>(config);
};
