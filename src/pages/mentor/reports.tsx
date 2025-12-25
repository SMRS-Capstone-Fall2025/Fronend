import { GradingForm } from "@/components/mentor/grading-form";
import { MentorProjectDetailDialog } from "@/components/mentor/mentor-project-detail-dialog";
import { PlagiarismCheckDialog } from "@/components/plagiarism/plagiarism-check-dialog";
import { PlagiarismResultDialog } from "@/components/plagiarism/plagiarism-result-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { useMentorReviewsQuery } from "@/services/final-report";
import {
  useCreateProjectScoreMutation,
  useProjectScoreQuery,
} from "@/services/grading";
import type {
  GradeSubmission,
  ProjectScoreCreateDto,
  ProjectScoreResponseDto,
} from "@/services/types";
import { MentorReviewDto } from "@/services/types/final-report";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MoreVertical,
  RefreshCw,
  Search,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MentorLayout from "./layout";

export default function MentorReports() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] =
    useState<MentorReviewDto | null>(null);
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false);
  const [projectDetailDialogOpen, setProjectDetailDialogOpen] = useState(false);
  const [projectForDetail, setProjectForDetail] =
    useState<MentorReviewDto | null>(null);
  const [plagiarismDialogOpen, setPlagiarismDialogOpen] = useState(false);
  const [projectForPlagiarism, setProjectForPlagiarism] =
    useState<MentorReviewDto | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [scanIdForResult, setScanIdForResult] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    refetch: refetchReviews,
  } = useMentorReviewsQuery();

  const allProjects = useMemo(
    () => projectsData?.projects || [],
    [projectsData]
  );

  const filteredProjects = useMemo(() => {
    let filtered = allProjects;

    if (debouncedSearch.trim()) {
      const keyword = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter((project) => {
        const searchFields = [
          project.projectName,
          project.projectType,
          project.councilName,
          project.councilCode,
          project.reportSubmittedBy,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        return searchFields.some((field) => field.includes(keyword));
      });
    }

    return filtered;
  }, [allProjects, debouncedSearch]);

  const paginatedProjects = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredProjects.length);
  }, [filteredProjects.length]);

  useEffect(() => {
    pagination.setPage(1);
  }, [debouncedSearch]);

  const handleGradeReport = (project: MentorReviewDto) => {
    setSelectedProject(project);
    setGradingDialogOpen(true);
  };

  const handleViewProjectDetail = (project: MentorReviewDto) => {
    setProjectForDetail(project);
    setProjectDetailDialogOpen(true);
  };

  const handleCheckPlagiarism = (project: MentorReviewDto) => {
    setProjectForPlagiarism(project);
    setPlagiarismDialogOpen(true);
  };

  const handleViewPlagiarismResult = (project: MentorReviewDto) => {
    // scanId là finalMilestoneId (id của report)
    setScanIdForResult(project.finalMilestoneId);
    setProjectForPlagiarism(project);
    setResultDialogOpen(true);
  };

  const convertGradeSubmissionToCreateDto = (
    data: GradeSubmission,
    project: MentorReviewDto
  ): ProjectScoreCreateDto => {
    const scoresMap = new Map(data.scores.map((s) => [s.criterionId, s.score]));

    return {
      projectId: project.projectId,
      finalReportId: project.finalMilestoneId,
      criteria1Score: scoresMap.get(1) ?? 0,
      criteria2Score: scoresMap.get(2) ?? 0,
      criteria3Score: scoresMap.get(3) ?? 0,
      criteria4Score: scoresMap.get(4) ?? 0,
      criteria5Score: scoresMap.get(5) ?? 0,
      criteria6Score: scoresMap.get(6) ?? 0,
      bonusScore1: scoresMap.get(7) ?? 0,
      bonusScore2: 0,
      comment: data.feedback ?? null,
    };
  };

  const convertProjectScoreToExistingGrade = (
    score: ProjectScoreResponseDto | null | undefined
  ) => {
    if (!score) return null;

    const scores = [
      { criterionId: 1, score: score.criteria1Score },
      { criterionId: 2, score: score.criteria2Score },
      { criterionId: 3, score: score.criteria3Score },
      { criterionId: 4, score: score.criteria4Score },
      { criterionId: 5, score: score.criteria5Score },
      { criterionId: 6, score: score.criteria6Score },
      { criterionId: 7, score: score.bonusScore1 },
    ];

    return {
      scores,
      totalScore: score.totalScore,
      feedback: score.comment ?? null,
    };
  };

  const createScoreMutation = useCreateProjectScoreMutation({
    onSuccess: async () => {
      toast({
        title: "Chấm điểm thành công",
        description: "Điểm đã được lưu và gửi đến sinh viên.",
      });
      setGradingDialogOpen(false);
      setSelectedProject(null);

      await refetchReviews();
    },
    onError: (error: unknown) => {
      toast({
        variant: "destructive",
        title: "Không thể lưu điểm",
        description: getErrorMessage(error, "Vui lòng thử lại sau."),
      });
    },
  });

  const handleSubmitGrade = (data: GradeSubmission) => {
    if (!selectedProject) return;

    if (selectedProject.hasScored && selectedProject.myScoreId != null) {
      toast({
        variant: "destructive",
        title: "Không thể cập nhật điểm",
        description: "Điểm đã được chấm và không thể thay đổi.",
      });
      return;
    }

    createScoreMutation.mutate(
      convertGradeSubmissionToCreateDto(data, selectedProject)
    );
  };

  const { data: existingProjectScore } = useProjectScoreQuery(
    selectedProject?.finalMilestoneId ?? null
  );

  const existingGrade =
    convertProjectScoreToExistingGrade(existingProjectScore);

  const columns: DataTableColumn<MentorReviewDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => {
          const globalIndex =
            (pagination.page - 1) * pagination.pageSize + index + 1;
          return <span className="text-muted-foreground">{globalIndex}</span>;
        },
      },
      {
        id: "project",
        header: "Dự án",
        render: (project) => (
          <div className="max-w-[300px]">
            <div className="font-medium truncate" title={project.projectName}>
              {project.projectName}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {project.projectType || "—"}
            </div>
          </div>
        ),
      },
      {
        id: "council",
        header: "Hội đồng",
        render: (project) =>
          project.councilId > 0 ? (
            <div className="max-w-[250px]">
              <div className="font-medium truncate" title={project.councilName}>
                {project.councilName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {project.councilCode}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "submittedByAndDate",
        header: "Người nộp & Ngày nộp",
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
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span
                  className="text-sm truncate"
                  title={project.reportSubmittedBy ?? "—"}
                >
                  {project.reportSubmittedBy ?? "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {formatDate(project.reportSubmissionDate)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "score",
        header: "Điểm",
        width: "120px",
        className: "text-center",
        headerClassName: "text-center",
        render: (project) => {
          if (project.hasScored && project.currentAverage != null) {
            return (
              <div className="flex flex-col gap-1">
                {project.currentAverage > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-lg text-primary">
                      {project.currentAverage.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                )}
                {project.myFinalScore != null && (
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-muted-foreground text-yellow-600">
                      Điểm của tôi: {project.myFinalScore.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            );
          }
          return <span className="text-muted-foreground">—</span>;
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        width: "130px",
        className: "text-center",
        headerClassName: "text-center",
        render: (project) => {
          if (project.hasScored && project.myScoreId != null) {
            return (
              <Badge className="bg-green-500 text-white text-nowrap">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Đã chấm
              </Badge>
            );
          }
          return (
            <Badge className="bg-orange-500 text-white text-nowrap">
              <Clock className="h-3 w-3 mr-1" />
              Đang chấm điểm
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        headerClassName: "text-right",
        className: "text-right",
        render: (project) => {
          const hasGrade = project.hasScored && project.myScoreId != null;
          const hasReportFile = Boolean(project.reportFilePath);
          const isChecked = project.isCheck === true;
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProjectDetail(project);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                  {hasReportFile && (
                    <>
                      <DropdownMenuSeparator />
                      {isChecked ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPlagiarismResult(project);
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Xem kết quả đạo văn
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckPlagiarism(project);
                          }}
                          className="text-yellow-600 focus:text-yellow-700 focus:bg-yellow-50 dark:focus:bg-yellow-950/30"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Kiểm tra đạo văn
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  {hasGrade ? (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGradeReport(project);
                      }}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Xem điểm
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGradeReport(project);
                      }}
                      className="text-green-600 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-950/30"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Chấm điểm
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Báo cáo sinh viên
                </h1>
                <p className="text-sm text-muted-foreground">
                  Xem và chấm điểm các báo cáo tiến độ mà sinh viên đã nộp
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                setIsRefreshing(true);
                await refetchReviews();
                // Animation quay một lần
                setTimeout(() => setIsRefreshing(false), 600);
              }}
              disabled={isLoadingProjects}
              title="Làm mới dữ liệu"
              className="h-10 w-10"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoadingProjects || isRefreshing ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                const value = event.target.value;
                setSearchTerm(value);
              }}
              className="pl-9"
              placeholder="Tìm kiếm theo tên dự án, loại, hội đồng, người nộp..."
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginatedProjects}
          isLoading={isLoadingProjects}
          emptyMessage={
            searchTerm.trim()
              ? "Không tìm thấy báo cáo nào phù hợp với tìm kiếm"
              : "Chưa có dự án nào cần chấm điểm"
          }
          emptyIcon={<FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />}
          keyExtractor={(project) => project.projectId}
        />

        {filteredProjects.length > 0 && (
          <div className="pt-4">
            <TablePagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={filteredProjects.length}
              totalPages={pagination.totalPages}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              isLoading={isLoadingProjects}
              onPrevious={() => pagination.previousPage()}
              onNext={() => pagination.nextPage()}
              onPageChange={(p) => pagination.setPage(p)}
              onPageSizeChange={(s) => pagination.setPageSize(s)}
            />
          </div>
        )}

        <MentorProjectDetailDialog
          open={projectDetailDialogOpen}
          onOpenChange={setProjectDetailDialogOpen}
          project={projectForDetail}
        />

        {projectForPlagiarism && (
          <PlagiarismCheckDialog
            open={plagiarismDialogOpen}
            onOpenChange={(open) => {
              setPlagiarismDialogOpen(open);
              if (!open) {
                setProjectForPlagiarism(null);
              }
            }}
            reportId={projectForPlagiarism.finalMilestoneId}
            reportFilePath={projectForPlagiarism.reportFilePath}
            projectName={projectForPlagiarism.projectName}
            isCheck={true}
            onResultReady={(scanId) => {
              // Khi polling thành công, tự động mở modal kết quả
              if (typeof scanId === "number") {
                setScanIdForResult(scanId);
                setResultDialogOpen(true);
                setPlagiarismDialogOpen(false);
              }
            }}
          />
        )}

        {projectForPlagiarism && (
          <PlagiarismResultDialog
            open={resultDialogOpen}
            onOpenChange={(open) => {
              setResultDialogOpen(open);
              if (!open) {
                setProjectForPlagiarism(null);
                setScanIdForResult(null);
              }
            }}
            scanId={scanIdForResult}
          />
        )}

        <Dialog open={gradingDialogOpen} onOpenChange={setGradingDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProject?.hasScored && selectedProject.myScoreId != null
                  ? "Xem điểm báo cáo"
                  : "Chấm điểm báo cáo"}
              </DialogTitle>
              <DialogDescription>
                {selectedProject?.projectName &&
                  `Dự án: ${selectedProject.projectName}`}
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <GradingForm
                milestoneId={selectedProject.finalMilestoneId}
                studentName={selectedProject.reportSubmittedBy ?? undefined}
                projectName={selectedProject.projectName}
                reportUrl={selectedProject.reportFilePath ?? undefined}
                reportComment={selectedProject.reportDescription ?? undefined}
                onSubmit={handleSubmitGrade}
                onCancel={() => setGradingDialogOpen(false)}
                isSubmitting={createScoreMutation.isPending}
                existingGrade={existingGrade ?? null}
                readOnly={
                  selectedProject.hasScored && selectedProject.myScoreId != null
                }
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MentorLayout>
  );
}
