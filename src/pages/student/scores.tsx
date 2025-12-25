import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TableFilters } from "@/components/ui/table-filters";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { useMyFinalReportsQuery } from "@/services/final-report";
import { useProjectScoresByProjectQuery } from "@/services/grading";
import { useProjectDetailQuery } from "@/services/project";
import type {
  ProjectFileInfoDto,
  ProjectImageInfoDto,
  ProjectMemberDetailDto,
  ProjectScoreResponseDto,
} from "@/services/types";
import type {
  LecturerScoreDto,
  ProjectReviewDto,
} from "@/services/types/final-report";
import { DEFAULT_GRADING_RUBRIC } from "@/services/types/grading";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import StudentLayout from "./layout";

export default function StudentScores() {
  const [selectedProject, setSelectedProject] =
    useState<ProjectReviewDto | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const { data: reportsData, isLoading: isLoadingReports } =
    useMyFinalReportsQuery();

  const projects = useMemo(
    () => reportsData?.projects ?? [],
    [reportsData?.projects]
  );

  const filteredProjects = useMemo(() => {
    if (!debouncedSearch) return projects;
    const keyword = debouncedSearch.toLowerCase();
    return projects.filter((project: ProjectReviewDto) => {
      const haystack = [
        project.projectName,
        project.projectType,
        project.reportTitle,
        project.councilName,
      ]
        .map((value) => value?.toLowerCase())
        .filter(Boolean) as string[];
      return haystack.some((value) => value.includes(keyword));
    });
  }, [projects, debouncedSearch]);

  const paginatedProjects = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredProjects.length);
  }, [filteredProjects.length, pagination]);

  useEffect(() => {
    pagination.setPage(1);
  }, [debouncedSearch]);

  const handleViewDetail = (project: ProjectReviewDto) => {
    setSelectedProject(project);
    setDetailDialogOpen(true);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.xlsx";
    link.download = "template.xlsx";
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: DataTableColumn<ProjectReviewDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => (
          <span className="text-muted-foreground">{index + 1}</span>
        ),
      },
      {
        id: "project",
        header: "Dự án",
        render: (project) => (
          <div className="max-w-xs">
            <div className="font-medium" title={project.projectName}>
              {project.projectName}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {project.projectType || "—"}
            </div>
          </div>
        ),
      },
      {
        id: "report",
        header: "Báo cáo",
        render: (project) => (
          <div className="max-w-xs">
            <div className="font-medium truncate" title={project.reportTitle}>
              {project.reportTitle}
            </div>
            <div className="text-xs text-muted-foreground">
              {project.reportDescription
                ? `${project.reportDescription.substring(0, 50)}...`
                : "—"}
            </div>
          </div>
        ),
      },
      {
        id: "council",
        header: "Hội đồng",
        render: (project) =>
          project.councilId > 0 ? (
            <div className="max-w-xs">
              <div className="font-medium truncate" title={project.councilName}>
                {project.councilName}
              </div>
              <div className="text-xs text-muted-foreground">
                {project.councilCode}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "submissionDate",
        header: "Ngày nộp",
        render: (project) => {
          const formatDate = (dateString: string | null | undefined) => {
            if (!dateString) return "—";
            try {
              return format(new Date(dateString), "dd/MM/yyyy HH:mm", {
                locale: vi,
              });
            } catch {
              return "—";
            }
          };
          return (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(project.reportSubmissionDate)}
            </div>
          );
        },
      },
      {
        id: "score",
        header: "Điểm trung bình",
        render: (project) => {
          if (project.averageScore > 0) {
            return (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xl text-primary">
                    {project.averageScore.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {project.totalScores} / {project.expectedTotalScores} giáo
                  viên
                </div>
              </div>
            );
          }
          return (
            <Badge
              variant="outline"
              className="text-muted-foreground text-nowrap"
            >
              <Clock className="h-3 w-3 mr-1" />
              Chưa có điểm
            </Badge>
          );
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        render: (project) => {
          const hasGrade = project.hasBeenScored;
          if (hasGrade) {
            return (
              <Badge className="bg-green-500 text-white text-nowrap">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Đã chấm
              </Badge>
            );
          }
          return (
            <Badge className="bg-blue-500 text-white text-nowrap">
              <Clock className="h-3 w-3 mr-1" />
              Chờ chấm
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        headerClassName: "text-right",
        className: "text-right",
        render: (project) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(project);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Điểm số báo cáo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Xem danh sách các báo cáo đã nộp và điểm số từ giáo viên chấm
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Tải template
            </Button>
          </div>
        </div>

        <TableFilters
          filters={useMemo(
            () => [
              {
                id: "search",
                type: "search",
                placeholder: "Tìm theo tên dự án, báo cáo, hoặc hội đồng...",
              },
            ],
            []
          )}
          values={useMemo(() => ({ search: searchTerm }), [searchTerm])}
          onChange={(filterId, value) => {
            if (filterId === "search") {
              setSearchTerm(value);
            }
          }}
          isLoading={isLoadingReports}
        />

        <DataTable
          columns={columns}
          data={paginatedProjects}
          isLoading={isLoadingReports}
          emptyMessage="Chưa có báo cáo nào được nộp"
          emptyIcon={<FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />}
          keyExtractor={(project) => String(project.projectId)}
        />

        {filteredProjects.length > 0 && (
          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            hasNext={pagination.hasNext}
            hasPrevious={pagination.hasPrevious}
            isLoading={isLoadingReports}
            onPrevious={pagination.previousPage}
            onNext={pagination.nextPage}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}

        <ProjectScoresDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          project={selectedProject}
        />
      </div>
    </StudentLayout>
  );
}

interface ProjectScoresDetailDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly project: ProjectReviewDto | null;
}

function ProjectScoresDetailDialog({
  open,
  onOpenChange,
  project,
}: ProjectScoresDetailDialogProps) {
  const projectId = project?.projectId ?? null;

  const { data: projectDetail, isLoading: isLoadingDetail } =
    useProjectDetailQuery(projectId, {
      enabled: open && projectId != null,
    });

  const shouldFetch =
    open &&
    projectId != null &&
    (!project?.lecturerScores || project.lecturerScores.length === 0);
  const { data: fetchedScores, isLoading: isLoadingScores } =
    useProjectScoresByProjectQuery(shouldFetch ? projectId : null);

  const allScores = project?.lecturerScores ?? fetchedScores ?? [];

  const averageScore =
    project?.averageScore ??
    (allScores.length > 0
      ? allScores.reduce(
          (sum: number, score: LecturerScoreDto | ProjectScoreResponseDto) =>
            sum + score.finalScore,
          0
        ) / allScores.length
      : 0);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", {
        locale: vi,
      });
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    if (statusLower === "approved") {
      return (
        <Badge className="bg-green-600 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Đã duyệt
        </Badge>
      );
    }
    if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Chờ duyệt
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 z-10 border-b border-blue-600/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-6 py-5 shadow-lg">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-white">
                  Chi tiết dự án và điểm số
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  {project?.projectName && `Dự án: ${project.projectName}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="px-6 py-6">
            <div className="space-y-6">
              {(project?.averageScore ?? averageScore) > 0 && (
                <Card className="border-2 border-primary bg-primary/5">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        Điểm trung bình
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-primary">
                          {(project?.averageScore ?? averageScore).toFixed(2)}
                        </span>
                        <span className="text-xl text-muted-foreground">
                          / 100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Từ {project?.totalScores ?? allScores.length} /{" "}
                        {project?.expectedTotalScores ?? 0} giáo viên chấm
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="scores">Điểm số</TabsTrigger>
                  <TabsTrigger value="members">Thành viên</TabsTrigger>
                  <TabsTrigger value="files">Tài liệu</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  {project && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Thông tin dự án</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Tên dự án:
                            </span>
                            <p className="mt-1 font-medium">
                              {projectDetail?.name ?? project.projectName}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Loại dự án:
                            </span>
                            <p className="mt-1">
                              {projectDetail?.type ?? project.projectType}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Trạng thái:
                            </span>
                            <div className="mt-1">
                              {getStatusBadge(
                                projectDetail?.status ?? project.projectStatus
                              )}
                            </div>
                          </div>
                          {projectDetail?.createDate && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">
                                Ngày tạo:
                              </span>
                              <p className="mt-1">
                                {formatDate(projectDetail.createDate)}
                              </p>
                            </div>
                          )}
                          {projectDetail?.dueDate && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">
                                Hạn chót:
                              </span>
                              <p className="mt-1">
                                {formatDate(projectDetail.dueDate)}
                              </p>
                            </div>
                          )}
                        </div>
                        {projectDetail?.description && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Mô tả:
                            </span>
                            <p className="mt-1 text-sm whitespace-pre-wrap">
                              {projectDetail.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {project && project.councilId > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Thông tin hội đồng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Tên hội đồng:
                            </span>
                            <p className="mt-1 font-medium">
                              {project.councilName}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Mã hội đồng:
                            </span>
                            <p className="mt-1">{project.councilCode}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Khoa/Bộ môn:
                            </span>
                            <p className="mt-1">{project.councilDepartment}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Tổng thành viên:
                            </span>
                            <p className="mt-1">
                              {project.expectedTotalScores || 0} người
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {projectDetail?.owner && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Nhóm trưởng
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {projectDetail.owner.name
                                ?.charAt(0)
                                .toUpperCase() ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {projectDetail.owner.name || "—"}
                            </p>
                            {projectDetail.owner.email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {projectDetail.owner.email}
                              </p>
                            )}
                            {projectDetail.owner.role && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {projectDetail.owner.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {project?.hasLecturerMentor && project.lecturerMentorName && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          Giảng viên hướng dẫn
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {project.lecturerMentorName
                                ?.charAt(0)
                                .toUpperCase() ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {project.lecturerMentorName}
                            </p>
                            {project.lecturerMentorEmail && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {project.lecturerMentorEmail}
                              </p>
                            )}
                            {project.lecturerMentorStatus && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {project.lecturerMentorStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {project && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Thông tin báo cáo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Tiêu đề báo cáo:
                            </span>
                            <p className="mt-1 font-medium">
                              {project.reportTitle || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Người nộp:
                            </span>
                            <p className="mt-1">
                              {project.reportSubmittedBy || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Ngày nộp:
                            </span>
                            <p className="mt-1">
                              {formatDate(project.reportSubmissionDate)}
                            </p>
                          </div>
                          {project.reportFilePath && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                File đính kèm:
                              </span>
                              <div className="mt-1">
                                <a
                                  href={project.reportFilePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                                >
                                  <Download className="h-3 w-3" />
                                  Tải xuống
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                        {project.reportDescription && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Mô tả báo cáo:
                            </span>
                            <p className="mt-1 text-sm whitespace-pre-wrap">
                              {project.reportDescription}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {projectDetail?.statistics && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Thống kê
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-primary">
                              {projectDetail.statistics.totalMembers || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tổng thành viên
                            </p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-green-600">
                              {projectDetail.statistics.approvedMembers || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Đã duyệt
                            </p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-blue-600">
                              {projectDetail.statistics.totalStudents || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sinh viên
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="scores" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Điểm số từng giáo viên</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingScores ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Đang tải...
                        </div>
                      ) : allScores.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Chưa có điểm số nào
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {allScores.map((score) => (
                            <ScoreCard
                              key={
                                "scoreId" in score ? score.scoreId : score.id
                              }
                              score={score}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="members" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Thành viên dự án
                        {projectDetail?.members && (
                          <Badge variant="outline" className="ml-2">
                            {projectDetail.members.length}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDetail ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Đang tải...
                        </div>
                      ) : !projectDetail?.members ||
                        projectDetail.members.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Chưa có thành viên nào
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {projectDetail.members.map(
                            (member: ProjectMemberDetailDto) => (
                              <div
                                key={member.id ?? member.accountId}
                                className="flex items-center gap-3 rounded-md border border-border/70 bg-background px-4 py-3 hover:bg-muted/50 transition-colors"
                              >
                                <Avatar>
                                  <AvatarFallback>
                                    {member.name?.charAt(0).toUpperCase() ??
                                      "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-0.5">
                                  <p className="font-medium">
                                    {member.name || "Chưa cập nhật"}
                                  </p>
                                  {member.email && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {member.email}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {member.role && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {member.role}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="files" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Tài liệu dự án
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {project?.reportFilePath && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Báo cáo cuối kỳ
                            </h4>
                            <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30">
                              <FileText className="h-5 w-5 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  File báo cáo
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(project.reportSubmissionDate)}
                                </p>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={project.reportFilePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Tải xuống
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}

                        {projectDetail?.files &&
                          projectDetail.files.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">
                                Tài liệu dự án
                              </h4>
                              <div className="space-y-2">
                                {projectDetail.files.map(
                                  (file: ProjectFileInfoDto) => (
                                    <div
                                      key={file.id}
                                      className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30"
                                    >
                                      <FileText className="h-5 w-5 text-primary" />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">
                                          {file.filePath?.split("/").pop() ||
                                            "File"}
                                        </p>
                                        {file.type && (
                                          <p className="text-xs text-muted-foreground">
                                            {file.type}
                                          </p>
                                        )}
                                      </div>
                                      {file.filePath && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          asChild
                                        >
                                          <a
                                            href={file.filePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <Download className="h-4 w-4 mr-1" />
                                            Tải xuống
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {projectDetail?.images &&
                          projectDetail.images.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Hình ảnh dự án
                              </h4>
                              <div className="grid grid-cols-3 gap-3">
                                {projectDetail.images.map(
                                  (image: ProjectImageInfoDto) => (
                                    <div
                                      key={image.id}
                                      className="relative aspect-video rounded-md overflow-hidden border border-border group"
                                    >
                                      <img
                                        src={image.url || ""}
                                        alt="Project image"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                                          asChild
                                        >
                                          <a
                                            href={image.url || ""}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {!project?.reportFilePath &&
                          (!projectDetail?.files ||
                            projectDetail.files.length === 0) &&
                          (!projectDetail?.images ||
                            projectDetail.images.length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              Chưa có tài liệu nào
                            </p>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function ScoreCard({
  score,
}: {
  score: LecturerScoreDto | ProjectScoreResponseDto;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", {
        locale: vi,
      });
    } catch {
      return "—";
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">
                    {score.lecturerName || "Giáo viên chấm"}
                  </p>
                  {score.scoreDate && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(score.scoreDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-primary">
                    {score.finalScore.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tổng: {score.totalScore.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t bg-muted/30">
            <div className="space-y-2 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Chi tiết điểm số
              </p>
              <div className="grid grid-cols-1 gap-2">
                {DEFAULT_GRADING_RUBRIC.criteria.map((criterion, index) => {
                  const criterionScore =
                    index === 0
                      ? score.criteria1Score
                      : index === 1
                      ? score.criteria2Score
                      : index === 2
                      ? score.criteria3Score
                      : index === 3
                      ? score.criteria4Score
                      : index === 4
                      ? score.criteria5Score
                      : index === 5
                      ? score.criteria6Score
                      : score.bonusScore1;

                  return (
                    <div
                      key={criterion.id}
                      className="flex items-start justify-between gap-2 text-xs bg-background rounded-md p-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground font-medium">
                          {index + 1}. {criterion.name}:
                        </span>
                        {criterion.description && (
                          <p className="text-[10px] text-muted-foreground/80 mt-1 italic">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span
                          className={cn(
                            "font-semibold",
                            index === 6 && criterionScore > 0
                              ? "text-green-600"
                              : "text-foreground"
                          )}
                        >
                          {criterionScore.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          / {criterion.maxScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {score.comment && (
              <div className="pt-3 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Nhận xét
                </p>
                <p className="text-sm bg-background rounded-md p-3">
                  {score.comment}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
