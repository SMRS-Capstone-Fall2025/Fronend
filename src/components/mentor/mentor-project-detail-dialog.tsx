import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectDetailQuery } from "@/services/project";
import type {
  ProjectFileInfoDto,
  ProjectImageInfoDto,
  ProjectMemberDetailDto,
} from "@/services/types";
import type { MentorReviewDto } from "@/services/types/final-report";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Image as ImageIcon,
  Mail,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";

interface MentorProjectDetailDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly project: MentorReviewDto | null;
}

export function MentorProjectDetailDialog({
  open,
  onOpenChange,
  project,
}: MentorProjectDetailDialogProps) {
  const projectId = project?.projectId ?? null;

  const {
    data: projectDetail,
    isLoading: isLoadingDetail,
    error: projectDetailError,
  } = useProjectDetailQuery(projectId, {
    enabled: open && projectId != null,
  });

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
    if (statusLower === "inreview" || statusLower === "in_review") {
      return (
        <Badge className="bg-purple-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Đang chấm điểm
        </Badge>
      );
    }
    if (statusLower === "inprogress") {
      return (
        <Badge className="bg-blue-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Đang thực hiện
        </Badge>
      );
    }
    if (statusLower === "completed") {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Hoàn thành
        </Badge>
      );
    }
    if (statusLower === "rejected") {
      return (
        <Badge className="bg-red-500 text-white">
          <X className="h-3 w-3 mr-1" />
          Từ chối
        </Badge>
      );
    }
    if (statusLower === "cancelled" || statusLower === "archived") {
      return (
        <Badge variant="outline" className="border-gray-400 text-gray-600">
          {statusLower === "cancelled" ? "Đã hủy" : "Lưu trữ"}
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getMemberStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    if (statusLower === "approved" || statusLower === "active") {
      return (
        <Badge variant="outline" className="border-green-500 text-green-700">
          Đã duyệt
        </Badge>
      );
    }
    if (statusLower === "pending") {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
          Chờ duyệt
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 [&>button]:text-white [&>button]:hover:text-blue-100 [&>button]:hover:bg-blue-700">
        <DialogHeader className="bg-blue-600 text-white rounded-t-lg px-6 pt-6 pb-4 mb-0">
          <DialogTitle className="text-white">Chi tiết dự án</DialogTitle>
          <DialogDescription className="text-blue-100">
            {project.projectName && `Dự án: ${project.projectName}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4 px-6 pt-4">
          <div className="space-y-6">
            {project.hasScored && project.myFinalScore != null && (
              <Card className="border-2 border-primary bg-primary/5">
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Award className="h-4 w-4" />
                      Điểm trung bình
                    </div>
                    {project.currentAverage != null ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-primary">
                            {project.currentAverage.toFixed(2)}
                          </span>
                          <span className="text-xl text-muted-foreground">
                            / 100
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Điểm của tôi: {project.myFinalScore.toFixed(2)} / 100
                          {" ("}
                          {project.totalScores} / {project.totalCouncilMembers}{" "}
                          người đã chấm)
                        </p>
                      </>
                    ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-primary">
                        {project.myFinalScore.toFixed(2)}
                      </span>
                      <span className="text-xl text-muted-foreground">
                        / 100
                      </span>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="members">Thành viên</TabsTrigger>
                <TabsTrigger value="files">Tài liệu</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {isLoadingDetail && (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                )}

                {projectDetailError && !isLoadingDetail && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-destructive">
                        <p className="font-medium">
                          Không thể tải thông tin dự án
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Vui lòng thử lại sau
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isLoadingDetail && !projectDetailError && (
                  <>
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
                              {projectDetail?.type ??
                                project.projectType ??
                                "—"}
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

                    {project.councilId > 0 && (
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
                              <p className="mt-1">
                                {project.councilDepartment}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Tổng thành viên:
                              </span>
                              <p className="mt-1">
                                {project.totalCouncilMembers || 0} người
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
                                {projectDetail.owner.name ||
                                  project.ownerName ||
                                  "—"}
                              </p>
                              {projectDetail.owner.email && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {projectDetail.owner.email}
                                </p>
                              )}
                              {projectDetail.owner.role && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs"
                                >
                                  {projectDetail.owner.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

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
                  </>
                )}
              </TabsContent>

              <TabsContent value="members" className="space-y-4 mt-4">
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Thành viên dự án
                        <Badge variant="outline" className="ml-2">
                          {projectDetail.members.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {projectDetail.members.map(
                          (member: ProjectMemberDetailDto) => (
                            <div
                              key={member.id ?? member.accountId}
                              className="flex items-center gap-3 rounded-md border border-border/70 bg-background px-4 py-3 hover:bg-muted/50 transition-colors"
                            >
                              <Avatar>
                                <AvatarFallback>
                                  {member.name?.charAt(0).toUpperCase() ?? "?"}
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
                                  <Badge variant="outline" className="text-xs">
                                    {member.role}
                                  </Badge>
                                )}
                                {getMemberStatusBadge(member.status)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                      {project.reportFilePath && (
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

                      {!project.reportFilePath &&
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
