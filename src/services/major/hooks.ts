import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { LecturerDto, MajorDto } from "@/services/types";
import { majorService } from "./service";

const majorKey = ["majors"] as const;

export const majorQueryKeys = {
  all: majorKey,
  lecturers: (majorId: number | null | undefined) =>
    [...majorKey, "lecturers", majorId ?? "unknown"] as const,
};

export const useMajorsQuery = (options?: UseQueryOptions<MajorDto[], Error>) =>
  useQuery<MajorDto[], Error>({
    queryKey: majorQueryKeys.all,
    queryFn: async () => {
      const result = await majorService.list();
      return result.majors;
    },
    staleTime: 5 * 60_000,
    ...options,
  });

export const useLecturersByMajorQuery = (
  majorId: number | null | undefined,
  options?: Omit<UseQueryOptions<LecturerDto[], Error>, "queryKey" | "queryFn">
) =>
  useQuery<LecturerDto[], Error>({
    queryKey: majorQueryKeys.lecturers(majorId),
    queryFn: () => majorService.getLecturersByMajor(majorId ?? 0),
    enabled: majorId != null && Number.isFinite(majorId),
    staleTime: 2 * 60_000,
    ...options,
  });
