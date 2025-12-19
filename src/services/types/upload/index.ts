import type { ApiEnvelope } from "../common";

export interface UploadResult {
  readonly url?: string | null;
  readonly path?: string | null;
}

export type UploadResponse = ApiEnvelope<string | UploadResult>;
