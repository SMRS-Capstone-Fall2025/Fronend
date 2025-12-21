import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Filter, Milestone, UserRound } from "lucide-react";
import type { MilestoneFilterOption, ProjectMemberOption } from "./types";

type TaskFiltersProps = {
  memberFilter: string;
  milestoneFilter: string;
  onMemberFilterChange: (value: string) => void;
  onMilestoneFilterChange: (value: string) => void;
  onClearFilters: () => void;
  isFilterActive: boolean;
  isFilterDisabled: boolean;
  memberOptions: ProjectMemberOption[];
  milestoneOptions: MilestoneFilterOption[];
  isProjectMembersLoading: boolean;
  isProjectDetailError: boolean;
  projectMembersErrorMessage: string;
  isMilestoneSelectLoading: boolean;
  isProjectMilestonesError: boolean;
  projectMilestonesErrorMessage: string;
};

export function TaskFilters({
  memberFilter,
  milestoneFilter,
  onMemberFilterChange,
  onMilestoneFilterChange,
  onClearFilters,
  isFilterActive,
  isFilterDisabled,
  memberOptions,
  milestoneOptions,
  isProjectMembersLoading,
  isProjectDetailError,
  projectMembersErrorMessage,
  isMilestoneSelectLoading,
  isProjectMilestonesError,
  projectMilestonesErrorMessage,
}: TaskFiltersProps) {
  return (
    <Card
      className={cn(
        "border transition-all",
        isFilterActive
          ? "border-emerald-300/60 bg-gradient-to-br from-emerald-50/80 via-emerald-50/40 to-background shadow-md shadow-emerald-100/50"
          : "border-border/60 bg-card"
      )}
    >
      <CardHeader className="pb-3 pt-3 px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter
              className={cn(
                "h-4 w-4",
                isFilterActive ? "text-emerald-600" : "text-muted-foreground"
              )}
            />
            <span className="text-sm font-semibold">Bộ lọc</span>
          </div>
          {isFilterActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={isFilterDisabled}
              className="px-2 text-xs h-5"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </CardHeader>

      {isFilterDisabled ? (
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-xs text-muted-foreground">
            Chọn một dự án để kích hoạt các bộ lọc.
          </p>
        </CardContent>
      ) : (
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <UserRound className="h-3.5 w-3.5" />
                <span>Thành viên phụ trách</span>
              </div>
              <Select
                value={memberFilter}
                onValueChange={onMemberFilterChange}
                disabled={isFilterDisabled}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue
                    placeholder={
                      isProjectMembersLoading
                        ? "Đang tải thành viên..."
                        : "Tất cả thành viên"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thành viên</SelectItem>
                  <SelectItem value="__unassigned">Chưa phân công</SelectItem>
                  {isProjectDetailError ? (
                    <SelectItem value="__error" disabled>
                      {projectMembersErrorMessage}
                    </SelectItem>
                  ) : isProjectMembersLoading ? (
                    <SelectItem value="__loading" disabled>
                      Đang tải thành viên...
                    </SelectItem>
                  ) : memberOptions.length === 0 ? (
                    <SelectItem value="__noMembers" disabled>
                      Chưa có thành viên
                    </SelectItem>
                  ) : (
                    memberOptions.map((member) => {
                      const roleBadgeColor =
                        member.role === "Owner" ||
                        member.role?.toLowerCase() === "owner"
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : member.role === "Lecturer" ||
                            member.role?.toLowerCase() === "lecturer"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-gray-100 text-gray-700 border-gray-200";

                      return (
                        <SelectItem key={member.value} value={member.value}>
                          <div className="flex max-w-[240px] flex-col text-left">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-[12px] font-normal text-foreground leading-tight">
                                {member.label}
                              </span>
                              {member.role && (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 h-4 font-semibold ${roleBadgeColor}`}
                                >
                                  {member.role}
                                </Badge>
                              )}
                            </div>
                            {member.description ? (
                              <span className="truncate text-[10px] text-muted-foreground leading-tight">
                                {member.description}
                              </span>
                            ) : null}
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Milestone className="h-3.5 w-3.5" />
                <span>Tiến trình dự án</span>
              </div>
              <Select
                value={milestoneFilter}
                onValueChange={onMilestoneFilterChange}
                disabled={isFilterDisabled}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue
                    placeholder={
                      isMilestoneSelectLoading
                        ? "Đang tải tiến độ..."
                        : "Tất cả tiến độ"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tiến độ</SelectItem>
                  <SelectItem value="__noMilestone">
                    Chưa gắn tiến độ
                  </SelectItem>
                  {isProjectMilestonesError ? (
                    <SelectItem value="__milestoneError" disabled>
                      {projectMilestonesErrorMessage}
                    </SelectItem>
                  ) : isMilestoneSelectLoading ? (
                    <SelectItem value="__milestoneLoading" disabled>
                      Đang tải tiến độ...
                    </SelectItem>
                  ) : milestoneOptions.length === 0 ? (
                    <SelectItem value="__milestoneEmpty" disabled>
                      Chưa có tiến độ
                    </SelectItem>
                  ) : (
                    milestoneOptions.map((milestone) => {
                      const progressText =
                        milestone.progressPercent != null
                          ? `Tiến độ ${milestone.progressPercent}%`
                          : null;
                      const dueText = milestone.dueDateDisplay
                        ? `Hạn ${milestone.dueDateDisplay}`
                        : null;
                      const statusText = milestone.status?.trim() ?? null;
                      const descriptionParts = [
                        progressText,
                        dueText,
                        statusText,
                      ].filter(Boolean);

                      return (
                        <SelectItem
                          key={milestone.value}
                          value={milestone.value}
                        >
                          <div className="flex max-w-[240px] flex-col text-left">
                            <span className="truncate text-xs font-no text-foreground leading-tight">
                              {milestone.label}
                            </span>
                            {descriptionParts.length > 0 ? (
                              <span className="truncate text-[10px] leading-tight text-muted-foreground">
                                {descriptionParts.join(" • ")}
                              </span>
                            ) : null}
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
