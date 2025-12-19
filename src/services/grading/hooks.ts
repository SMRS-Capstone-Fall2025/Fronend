import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  GradeSubmission,
  GradeResponse,
  ProjectScoreCreateDto,
  ProjectScoreUpdateDto,
  ProjectScoreResponseDto,
} from "../types";
import { gradingService } from "./service";
import { milestoneQueryKeys } from "../milestone/hooks";
import { finalReportQueryKeys } from "../final-report/hooks";

const gradingKey = ["grading"] as const;
const projectScoreKey = ["project-scores"] as const;

export const gradingQueryKeys = {
  all: gradingKey,
  byMilestone: (milestoneId: number | null) =>
    [...gradingKey, "milestone", milestoneId ?? "unknown"] as const,
  projectScores: {
    all: projectScoreKey,
    byMilestone: (milestoneId: number | null) =>
      [...projectScoreKey, "milestone", milestoneId ?? "unknown"] as const,
    byProject: (projectId: number | null) =>
      [...projectScoreKey, "project", projectId ?? "unknown"] as const,
    myScores: () => [...projectScoreKey, "my-scores"] as const,
  },
};

export const useGradeQuery = (
  milestoneId: number | null,
  options?: UseQueryOptions<GradeResponse | null, Error>
) =>
  useQuery<GradeResponse | null, Error>({
    queryKey: gradingQueryKeys.byMilestone(milestoneId),
    queryFn: () =>
      milestoneId != null
        ? gradingService.getGrade(milestoneId)
        : Promise.resolve(null),
    enabled: milestoneId != null,
    staleTime: 30_000,
    ...options,
  });

export const useSubmitGradeMutation = (
  options?: UseMutationOptions<
    GradeResponse,
    Error,
    { milestoneId: number; payload: GradeSubmission }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    GradeResponse,
    Error,
    { milestoneId: number; payload: GradeSubmission }
  >({
    mutationFn: ({ milestoneId, payload }) =>
      gradingService.submitGrade(milestoneId, payload),
    onSuccess: async (data, variables, context) => {

      await queryClient.invalidateQueries({
        queryKey: gradingQueryKeys.byMilestone(variables.milestoneId),
      });

      await queryClient.invalidateQueries({
        queryKey: milestoneQueryKeys.all,
      });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useProjectScoreQuery = (
  finalMilestoneId: number | null,
  options?: UseQueryOptions<ProjectScoreResponseDto | null, Error>
) =>
  useQuery<ProjectScoreResponseDto | null, Error>({
    queryKey: gradingQueryKeys.projectScores.byMilestone(finalMilestoneId),
    queryFn: () =>
      finalMilestoneId != null
        ? gradingService.getProjectScoreByMilestone(finalMilestoneId)
        : Promise.resolve(null),
    enabled: finalMilestoneId != null,
    staleTime: 30_000,
    ...options,
  });

export const useCreateProjectScoreMutation = (
  options?: UseMutationOptions<
    ProjectScoreResponseDto,
    Error,
    ProjectScoreCreateDto
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<ProjectScoreResponseDto, Error, ProjectScoreCreateDto>({
    mutationFn: (payload) => gradingService.createProjectScore(payload),
    onSuccess: async (data, variables, context) => {

      await queryClient.invalidateQueries({
        queryKey: gradingQueryKeys.projectScores.all,
      });
      await queryClient.invalidateQueries({
        queryKey: gradingQueryKeys.projectScores.byMilestone(
          variables.finalReportId
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: gradingQueryKeys.projectScores.byProject(variables.projectId),
      });

      await queryClient.invalidateQueries({
        queryKey: finalReportQueryKeys.projectsToReview(),
      });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useUpdateProjectScoreMutation = (
  options?: UseMutationOptions<
    ProjectScoreResponseDto,
    Error,
    { scoreId: number; payload: ProjectScoreUpdateDto }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ProjectScoreResponseDto,
    Error,
    { scoreId: number; payload: ProjectScoreUpdateDto }
  >({
    mutationFn: ({ scoreId, payload }) =>
      gradingService.updateProjectScore(scoreId, payload),
    onSuccess: async (data, variables, context) => {

      await queryClient.invalidateQueries({
        queryKey: gradingQueryKeys.projectScores.all,
      });

      await queryClient.invalidateQueries({
        queryKey: finalReportQueryKeys.projectsToReview(),
      });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
};

export const useProjectScoresByProjectQuery = (
  projectId: number | null,
  options?: UseQueryOptions<ProjectScoreResponseDto[], Error>
) =>
  useQuery<ProjectScoreResponseDto[], Error>({
    queryKey: gradingQueryKeys.projectScores.byProject(projectId),
    queryFn: () =>
      projectId != null
        ? gradingService.getProjectScoresByProject(projectId)
        : Promise.resolve([]),
    enabled: projectId != null,
    staleTime: 30_000,
    ...options,
  });

