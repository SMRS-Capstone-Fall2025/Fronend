import {
  keepPreviousData,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  CouncilPerformanceDto,
  DeanOverviewDto,
  MentorProjectPerformanceDto,
  RecentScoreDto,
  ScoringProgressDto,
  TimelineChartDto,
} from "./service";
import { deanStatsService } from "./service";

const deanStatsKey = ["dean-stats"] as const;

export const deanStatsQueryKeys = {
  all: deanStatsKey,
  overview: () => [...deanStatsKey, "overview"] as const,
  mentorProjectsStatus: () => [...deanStatsKey, "mentor-projects-status"] as const,
  scoringProgress: () => [...deanStatsKey, "scoring-progress"] as const,
  mentorProjectsPerformance: () =>
    [...deanStatsKey, "mentor-projects-performance"] as const,
  myCouncilsStats: () => [...deanStatsKey, "my-councils-stats"] as const,
  recentScores: (limit?: number) =>
    [...deanStatsKey, "recent-scores", limit] as const,
  scoreDistribution: () => [...deanStatsKey, "score-distribution"] as const,
  decisionTimeline: (year?: number, months?: number) =>
    [...deanStatsKey, "decision-timeline", year, months] as const,
};

export const useDeanOverviewQuery = (
  options?: UseQueryOptions<DeanOverviewDto, Error>
) => {
  return useQuery<DeanOverviewDto, Error>({
    queryKey: deanStatsQueryKeys.overview(),
    queryFn: () => deanStatsService.getOverview(),
    ...options,
  });
};

export const useMentorProjectsStatusQuery = (
  options?: UseQueryOptions<Record<string, number>, Error>
) => {
  return useQuery<Record<string, number>, Error>({
    queryKey: deanStatsQueryKeys.mentorProjectsStatus(),
    queryFn: () => deanStatsService.getMentorProjectsStatus(),
    ...options,
  });
};

export const useScoringProgressQuery = (
  options?: UseQueryOptions<ScoringProgressDto, Error>
) => {
  return useQuery<ScoringProgressDto, Error>({
    queryKey: deanStatsQueryKeys.scoringProgress(),
    queryFn: () => deanStatsService.getScoringProgress(),
    ...options,
  });
};

export const useMentorProjectsPerformanceQuery = (
  options?: UseQueryOptions<readonly MentorProjectPerformanceDto[], Error>
) => {
  return useQuery<readonly MentorProjectPerformanceDto[], Error>({
    queryKey: deanStatsQueryKeys.mentorProjectsPerformance(),
    queryFn: () => deanStatsService.getMentorProjectsPerformance(),
    ...options,
  });
};

export const useMyCouncilsStatsQuery = (
  options?: UseQueryOptions<readonly CouncilPerformanceDto[], Error>
) => {
  return useQuery<readonly CouncilPerformanceDto[], Error>({
    queryKey: deanStatsQueryKeys.myCouncilsStats(),
    queryFn: () => deanStatsService.getMyCouncilsStats(),
    ...options,
  });
};

export const useRecentScoresQuery = (
  limit = 20,
  options?: UseQueryOptions<readonly RecentScoreDto[], Error>
) => {
  return useQuery<readonly RecentScoreDto[], Error>({
    queryKey: deanStatsQueryKeys.recentScores(limit),
    queryFn: () => deanStatsService.getRecentScores(limit),
    ...options,
  });
};

export const useScoreDistributionQuery = (
  options?: UseQueryOptions<Record<string, number>, Error>
) => {
  return useQuery<Record<string, number>, Error>({
    queryKey: deanStatsQueryKeys.scoreDistribution(),
    queryFn: () => deanStatsService.getScoreDistribution(),
    ...options,
  });
};

export const useDecisionTimelineQuery = (
  year?: number,
  months?: number,
  options?: UseQueryOptions<TimelineChartDto, Error>
) => {
  return useQuery<TimelineChartDto, Error>({
    queryKey: deanStatsQueryKeys.decisionTimeline(year, months),
    queryFn: () => deanStatsService.getDecisionTimeline(year, months),
    placeholderData: keepPreviousData,
    ...options,
  });
};

