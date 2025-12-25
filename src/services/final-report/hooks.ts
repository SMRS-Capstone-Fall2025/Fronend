import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  FinalReportListResult,
  MentorReviewListResult,
  ProjectReviewListResult,
} from "../types/final-report";
import { finalReportService } from "./service";

const finalReportsKey = ["final-reports"] as const;
const projectsToReviewKey = ["projects-to-review"] as const;
const mentorReviewsKey = ["mentor-reviews"] as const;

export const finalReportQueryKeys = {
  all: finalReportsKey,
  list: (params?: { pageNumber?: number; pageSize?: number }) =>
    [...finalReportsKey, "list", params ?? {}] as const,
  projectsToReview: () => [...projectsToReviewKey] as const,
  myFinalReports: () => [...finalReportsKey, "my-final-reports"] as const,
  mentorReviews: () => [...mentorReviewsKey] as const,
};

export const useFinalReportsQuery = (
  params?: { pageNumber?: number; pageSize?: number },
  options?: UseQueryOptions<FinalReportListResult, Error>
) =>
  useQuery<FinalReportListResult, Error>({
    queryKey: finalReportQueryKeys.list(params),
    queryFn: () => finalReportService.list(params),
    staleTime: 30_000,
    ...options,
  });

export const useProjectsToReviewQuery = (
  options?: UseQueryOptions<ProjectReviewListResult, Error>
) =>
  useQuery<ProjectReviewListResult, Error>({
    queryKey: finalReportQueryKeys.projectsToReview(),
    queryFn: () => finalReportService.getProjectsToReview(),
    staleTime: 30_000,
    ...options,
  });

export const useMyFinalReportsQuery = (
  options?: UseQueryOptions<ProjectReviewListResult, Error>
) =>
  useQuery<ProjectReviewListResult, Error>({
    queryKey: finalReportQueryKeys.myFinalReports(),
    queryFn: () => finalReportService.getMyFinalReports(),
    staleTime: 30_000,
    ...options,
  });

export const useMentorReviewsQuery = (
  options?: UseQueryOptions<MentorReviewListResult, Error>
) =>
  useQuery<MentorReviewListResult, Error>({
    queryKey: finalReportQueryKeys.mentorReviews(),
    queryFn: () => finalReportService.getMentorReviews(),
    staleTime: 30_000,
    ...options,
  });
