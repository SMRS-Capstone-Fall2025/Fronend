import type { Ref } from "react";
import { useEffect, useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProjectsQuery } from "@/services/project";
import type {
  ProjectListItemDto,
  ProjectListQuery,
  ProjectStatusApi,
} from "@/services/types/project";

export type ProjectSelectOption = {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly status?: ProjectStatusApi | null;
  readonly dueDate?: string | null;
  readonly raw: ProjectListItemDto;
};

export type ProjectSelectProps = {
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onProjectChange?: (project: ProjectSelectOption | null) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly triggerRef?: Ref<HTMLButtonElement>;
  readonly triggerClassName?: string;
  readonly contentClassName?: string;
  readonly emptyLabel?: string;
  readonly loadingLabel?: string;
  readonly errorLabel?: string;
  readonly queryParams?: ProjectListQuery;
};

const defaultQueryParams: ProjectListQuery = {
  page: 0,
  size: 50,
  sortDir: "desc",
  status: "Approved",
  isMine: true,
};

const normalizeProjects = (
  items: ProjectListItemDto[] | undefined
): ProjectSelectOption[] => {
  if (!items || items.length === 0) return [];
  return items
    .map((item, index) => {
      const fallbackId = `project-${index}`;
      const id =
        item?.id !== undefined && item?.id !== null
          ? String(item.id)
          : fallbackId;

      return {
        id,
        name: item?.name ?? "Chưa có tên",
        description: item?.description ?? undefined,
        status: item?.status ?? undefined,
        dueDate: item?.dueDate ?? undefined,
        raw: item,
      } satisfies ProjectSelectOption;
    })
    .filter((project) => project.id.trim().length > 0);
};

export function ProjectSelect({
  value,
  onValueChange,
  onProjectChange,
  placeholder = "Chọn dự án",
  disabled,
  triggerRef,
  triggerClassName,
  contentClassName,
  emptyLabel = "Chưa có dự án nào",
  loadingLabel = "Đang tải danh sách dự án...",
  errorLabel = "Không thể tải danh sách dự án",
  queryParams,
}: ProjectSelectProps) {
  const enforcedQueryParams = useMemo<ProjectListQuery>(() => {
    return {
      ...defaultQueryParams,
      ...queryParams,
      isMine: true,
      status: !queryParams?.hasFinalReport ? "Approved" : null,
    };
  }, [queryParams]);

  const { data, isLoading, isFetching, isError } =
    useProjectsQuery(enforcedQueryParams);

  const options = useMemo(() => {
    const normalized = normalizeProjects(data?.content);
    // Filter by hasFinalReport if queryParams has it
    if (enforcedQueryParams.hasFinalReport === true) {
      return normalized.filter(
        (project) => project.raw.hasFinalReport === true
      );
    }
    return normalized;
  }, [data?.content, enforcedQueryParams.hasFinalReport]);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((item) => item.id === value) ?? null;
  }, [options, value]);

  useEffect(() => {
    if (!onProjectChange) return;
    onProjectChange(selectedOption ?? null);
  }, [selectedOption, onProjectChange]);

  const handleChange = (nextValue: string) => {
    onValueChange?.(nextValue);
    if (onProjectChange) {
      const project = options.find((item) => item.id === nextValue) ?? null;
      onProjectChange(project);
    }
  };

  const hasOptions = options.length > 0;
  const isBusy = isLoading || isFetching;
  const isSelectDisabled = disabled || (isLoading && !hasOptions);
  const triggerPlaceholder = isBusy && !hasOptions ? loadingLabel : placeholder;

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={isSelectDisabled}
    >
      <SelectTrigger
        ref={triggerRef}
        className={cn(
          "w-full items-center justify-between gap-3 overflow-hidden px-4 py-3 text-left max-w-[680px]",
          "h-11",
          triggerClassName,
          {
            "opacity-70": isBusy && hasOptions,
          }
        )}
      >
        {selectedOption ? (
          <div className="flex flex-1 flex-col overflow-hidden text-left">
            <span className="truncate text-sm font-medium text-foreground">
              {selectedOption.name}
            </span>
            {selectedOption.description && (
              <span className="truncate text-[10px] text-muted-foreground line-clamp-1 leading-tight">
                {selectedOption.description}
              </span>
            )}
          </div>
        ) : (
          <SelectValue placeholder={triggerPlaceholder} />
        )}
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {isBusy && !hasOptions ? (
          <SelectItem value="__loading" disabled className="text-xs">
            {loadingLabel}
          </SelectItem>
        ) : isError ? (
          <SelectItem value="__error" disabled className="text-xs">
            {errorLabel}
          </SelectItem>
        ) : !hasOptions ? (
          <SelectItem value="__empty" disabled className="text-xs">
            {emptyLabel}
          </SelectItem>
        ) : (
          options.map((project) => (
            <SelectItem
              key={project.id}
              value={project.id}
              className="py-2 max-w-[680px] overflow-hidden"
            >
              <div className="flex flex-col gap-1 text-left">
                <span className="truncate text-sm font-medium text-foreground">
                  {project.name}
                </span>
                {project.description ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {project.description}
                  </span>
                ) : null}
                {project.status === "Pending" ? (
                  <span className="text-[11px] font-medium uppercase tracking-wide text-amber-600">
                    Đang chờ hội đồng duyệt
                  </span>
                ) : null}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
