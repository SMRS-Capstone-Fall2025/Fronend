import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectDetailQuery } from "@/services/project";
import { ProjectReviewDto } from "@/services/types/final-report";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

interface ProjectDetailContentProps {
  project: ProjectReviewDto;
  onGradeReport: (project: ProjectReviewDto) => void;
  onClose: () => void;
}

export function ProjectDetailContent({
  project,
  onGradeReport,
  onClose,
}: ProjectDetailContentProps) {
  const { data: projectDetail, isLoading: isLoadingDetail } =
    useProjectDetailQuery(project.projectId);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    if (statusLower === "completed") {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Hoàn thành
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
    if (statusLower === "approved") {
      return (
        <Badge className="bg-green-600 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Đã duyệt
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (isLoadingDetail) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="report">Báo cáo</TabsTrigger>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          <TabsTrigger value="files">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin dự án
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Tên dự án:
                  </span>
                  <p className="mt-1 font-medium">{project.projectName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Loại dự án:
                  </span>
                  <p className="mt-1">{project.projectType || "—"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Trạng thái:
                  </span>
                  <div className="mt-1">
                    {getStatusBadge(project.projectStatus) || "—"}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày tạo:
                  </span>
                  <p className="mt-1">
                    {formatDate(project.projectCreateDate)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Hạn nộp:
                  </span>
                  <p className="mt-1">{formatDate(project.projectDueDate)}</p>
                </div>
                {projectDetail?.statistics && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Tổng thành viên:
                    </span>
                    <p className="mt-1">
                      {projectDetail.statistics.totalMembers || 0} người
                    </p>
                  </div>
                )}
              </div>
              {project.projectDescription && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Mô tả dự án:
                  </span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {project.projectDescription}
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
                    <p className="mt-1 font-medium">{project.councilName}</p>
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
                    <p className="mt-1">{project.councilDepartment || "—"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Tổng thành viên hội đồng:
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
                      {projectDetail.owner.name?.charAt(0).toUpperCase() ?? "?"}
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

          {projectDetail?.lecturer && (
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
                      {projectDetail.lecturer.name?.charAt(0).toUpperCase() ??
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {projectDetail.lecturer.name || "—"}
                    </p>
                    {projectDetail.lecturer.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {projectDetail.lecturer.email}
                      </p>
                    )}
                    {projectDetail.lecturer.status && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {projectDetail.lecturer.status}
                      </Badge>
                    )}
                  </div>
                </div>
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

        <TabsContent value="report" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin báo cáo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <p className="mt-1">{project.reportSubmittedBy || "—"}</p>
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
                        <ExternalLink className="h-3 w-3" />
                        Xem file
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5" />
                Thông tin chấm điểm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Trạng thái:
                  </span>
                  <div className="mt-1">
                    {project.hasBeenScored ? (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Đã chấm
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        Chờ chấm
                      </Badge>
                    )}
                  </div>
                </div>
                {project.hasBeenScored && (
                  <>
                    {project.averageScore > 0 && (
                      <div className="col-span-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Điểm trung bình:
                        </span>
                        <div className="mt-2 p-4 rounded-lg bg-primary/10 border-2 border-primary">
                          <p className="font-bold text-3xl text-primary text-center">
                            {project.averageScore.toFixed(2)}
                            <span className="text-lg text-muted-foreground ml-1">
                              / 100
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                    {(() => {
                      const myScore = project.lecturerScores?.find(
                        (score) => score.lecturerId === project.myMemberId
                      );
                      return myScore ? (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Điểm của tôi:
                          </span>
                          <p className="mt-1 font-medium text-base text-muted-foreground">
                            {myScore.finalScore.toFixed(2)} / 100
                          </p>
                        </div>
                      ) : null;
                    })()}
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Đã chấm:
                      </span>
                      <p className="mt-1 text-sm">
                        {project.totalScores} / {project.expectedTotalScores}
                      </p>
                    </div>
                  </>
                )}
              </div>
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
              {!projectDetail?.members || projectDetail.members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có thành viên nào
                </p>
              ) : (
                <div className="space-y-3">
                  {projectDetail.members.map((member) => (
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
                      </div>
                    </div>
                  ))}
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
                {project.reportFilePath && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Báo cáo cuối kỳ
                    </h4>
                    <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">File báo cáo</p>
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

                {projectDetail?.files && projectDetail.files.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tài liệu dự án</h4>
                    <div className="space-y-2">
                      {projectDetail.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30"
                        >
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {file.filePath?.split("/").pop() || "File"}
                            </p>
                            {file.type && (
                              <p className="text-xs text-muted-foreground">
                                {file.type}
                              </p>
                            )}
                          </div>
                          {file.filePath && (
                            <Button variant="outline" size="sm" asChild>
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
                      ))}
                    </div>
                  </div>
                )}

                {projectDetail?.images && projectDetail.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Hình ảnh dự án
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {projectDetail.images.map((image) => (
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
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!project.reportFilePath &&
                  (!projectDetail?.files || projectDetail.files.length === 0) &&
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

      <Separator className="my-4" />

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        {(() => {
          const myScore = project.lecturerScores?.find(
            (score) => score.lecturerId === project.myMemberId
          );
          return !myScore ? (
            <Button onClick={() => onGradeReport(project)}>
              <Award className="h-4 w-4 mr-2" />
              Chấm điểm
            </Button>
          ) : null;
        })()}
      </div>
    </ScrollArea>
  );
}
