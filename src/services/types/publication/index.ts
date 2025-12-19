import type { ApiEnvelope } from "../common";

export type PublicationStatus = "Registered" | "Published" | "Cancelled";

export type PublicationType = "Journal" | "Conference";

export interface ProjectInfo {
  readonly projectId?: number;
  readonly projectName?: string | null;
  readonly projectDescription?: string | null;
  readonly projectType?: string | null;
  readonly projectStatus?: string | null;
  readonly projectCreateDate?: string | null;
  readonly projectDueDate?: string | null;
  readonly ownerId?: number;
  readonly ownerName?: string | null;
  readonly ownerEmail?: string | null;
  readonly ownerRole?: string | null;
  readonly majorId?: number;
  readonly majorName?: string | null;
}

export interface AuthorInfo {
  readonly authorId?: number;
  readonly authorName?: string | null;
  readonly authorEmail?: string | null;
  readonly authorPhone?: string | null;
  readonly authorAvatar?: string | null;
  readonly authorRole?: string | null;
  readonly authorAge?: number;
  readonly authorStatus?: string | null;
}

export interface ProjectPublicationDto {
  readonly id?: number;
  readonly status?: PublicationStatus | null;
  readonly publicationName?: string | null;
  readonly publicationType?: PublicationType | null;
  readonly publicationLink?: string | null;
  readonly registeredDate?: string | null;
  readonly publishedDate?: string | null;
  readonly notes?: string | null;
  readonly doi?: string | null;
  readonly isbnIssn?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly project?: ProjectInfo | null;
  readonly author?: AuthorInfo | null;
}

export interface CreatePublicationRequest {
  readonly projectId: number;
  readonly publicationName: string;
  readonly publicationType: PublicationType;
  readonly publicationLink?: string | null;
  readonly notes?: string | null;
  readonly doi?: string | null;
  readonly to?: string | null;
}

export interface UpdatePublicationRequest {
  readonly publicationName?: string | null;
  readonly publicationType?: PublicationType | null;
  readonly publicationLink?: string | null;
  readonly status?: PublicationStatus | null;
  readonly notes?: string | null;
  readonly doi?: string | null;
  readonly isbnIssn?: string | null;
}

export type PublicationResponse = ApiEnvelope<ProjectPublicationDto>;
export type PublicationListResponse = ApiEnvelope<ProjectPublicationDto[]>;
