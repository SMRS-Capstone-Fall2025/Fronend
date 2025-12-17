import { ProjectDetailDialog } from "@/components/projects/ProjectDetailDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateDisplay, formatDateTimeDisplay } from "@/lib/date-utils";
import { useProjectDetailQuery } from "@/services/project";
import type {
  ProjectPublicationDto,
  PublicationStatus,
  PublicationType,
} from "@/services/types";
import type { ProjectListItemDto } from "@/services/types/project";
import {
  Calendar,
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  Journal: "Tạp chí",
  Conference: "Hội thảo",
};

const PUBLICATION_TYPE_COLORS: Record<PublicationType, string> = {
  Journal: "bg-purple-100 text-purple-800 border-purple-200",
  Conference: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  Registered: "Đã đăng ký",
  Published: "Đã xuất bản",
  Cancelled: "Đã hủy",
};

const PUBLICATION_STATUS_COLORS: Record<PublicationStatus, string> = {
  Registered: "bg-blue-100 text-blue-800 border-blue-200",
  Published: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

type PublicationTableProps = {
  readonly publications: ProjectPublicationDto[];
  readonly isLoading?: boolean;
  readonly onEdit?: (publication: ProjectPublicationDto) => void;
  readonly onDelete?: (publication: ProjectPublicationDto) => void;
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
  readonly showProject?: boolean;
  readonly showAuthor?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
};

export function PublicationTable({
  publications,
  isLoading = false,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  showProject = false,
  showAuthor = false,
  page = 1,
  pageSize = 10,
}: PublicationTableProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<ProjectPublicationDto | null>(null);

  const projectId = selectedPublication?.project?.projectId ?? null;
  const { data: projectDetail, isLoading: isProjectDetailLoading } =
    useProjectDetailQuery(projectId, {
      enabled: projectDetailOpen && projectId != null,
    });

  const openDetail = (publication: ProjectPublicationDto) => {
    setSelectedPublication(publication);
    setDetailOpen(true);
  };

  const handleOpenProjectDetail = () => {
    setProjectDetailOpen(true);
  };

  const columns: DataTableColumn<ProjectPublicationDto>[] = [
    {
      id: "index",
      header: "#",
      headerClassName: "text-center",
      className: "text-center w-16",
      render: (_, index) => {
        const globalIndex = page && pageSize ? (page - 1) * pageSize + index + 1 : index + 1;
        return <span className="text-muted-foreground">{globalIndex}</span>;
      },
    },
    {
      id: "publicationName",
      header: "Tên publication",
      render: (pub) => (
        <div className="font-medium">{pub.publicationName ?? "—"}</div>
      ),
    },
    {
      id: "publicationType",
      header: "Loại",
      render: (pub) => {
        const type = pub.publicationType;
        if (!type) return "—";
        const label = PUBLICATION_TYPE_LABELS[type] ?? type;
        const colorClass =
          PUBLICATION_TYPE_COLORS[type as PublicationType] ?? "";
        return (
          <Badge variant="outline" className={colorClass}>
            {label}
          </Badge>
        );
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      render: (pub) => {
        const status = pub.status;
        if (!status) return "—";
        return (
          <Badge
            variant="outline"
            className={
              PUBLICATION_STATUS_COLORS[status as PublicationStatus] ?? ""
            }
          >
            {PUBLICATION_STATUS_LABELS[status as PublicationStatus] ?? status}
          </Badge>
        );
      },
    },
    ...(showProject
      ? [
          {
            id: "project",
            header: "Dự án",
            render: (pub) => (
              <div className="text-sm">{pub.project?.projectName ?? "—"}</div>
            ),
          } as DataTableColumn<ProjectPublicationDto>,
        ]
      : []),
    ...(showAuthor
      ? [
          {
            id: "author",
            header: "Tác giả",
            render: (pub) => (
              <div className="text-sm">{pub.author?.authorName ?? "—"}</div>
            ),
          } as DataTableColumn<ProjectPublicationDto>,
        ]
      : []),
    {
      id: "registeredDate",
      header: "Ngày đăng ký",
      render: (pub) => (
        <div className="text-sm text-muted-foreground">
          {formatDateDisplay(pub.registeredDate) ?? "—"}
        </div>
      ),
    },
    {
      id: "publishedDate",
      header: "Ngày xuất bản",
      render: (pub) => (
        <div className="text-sm text-muted-foreground">
          {formatDateDisplay(pub.publishedDate) ?? "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      headerClassName: "text-right",
      className: "text-right",
      render: (pub) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(pub);
            }}
          >
            Xem
          </Button>
          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(pub);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Sửa
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <>
                    {canEdit && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(pub);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={publications}
        isLoading={isLoading}
        emptyMessage="Chưa có publication nào"
        onRowClick={openDetail}
        keyExtractor={(pub) => pub.id?.toString() ?? ""}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden border border-border/60 bg-background p-0 shadow-2xl flex flex-col">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-b border-blue-600/20 px-6 py-6 text-left sm:px-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <DialogHeader className="relative">
              <DialogTitle className="text-white text-xl font-semibold">
                Chi tiết Publication
              </DialogTitle>
              <DialogDescription className="text-blue-100/90 mt-2">
                Thông tin chi tiết về publication
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 sm:p-10">
              {selectedPublication && (
                <div className="space-y-6">
                  {/* Header Section */}
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-3">
                          {selectedPublication.publicationName ?? "—"}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedPublication.publicationType && (
                            <Badge
                              variant="outline"
                              className={
                                PUBLICATION_TYPE_COLORS[
                                  selectedPublication.publicationType as PublicationType
                                ] ?? ""
                              }
                            >
                              {PUBLICATION_TYPE_LABELS[
                                selectedPublication.publicationType as PublicationType
                              ] ?? selectedPublication.publicationType}
                            </Badge>
                          )}
                          {selectedPublication.status && (
                            <Badge
                              variant="outline"
                              className={
                                PUBLICATION_STATUS_COLORS[
                                  selectedPublication.status as PublicationStatus
                                ] ?? ""
                              }
                            >
                              {PUBLICATION_STATUS_LABELS[
                                selectedPublication.status as PublicationStatus
                              ] ?? selectedPublication.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Project & Author Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedPublication.project && (
                      <Card>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <h3 className="font-semibold text-foreground">
                                Dự án
                              </h3>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleOpenProjectDetail}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </Button>
                          </div>
                          <div>
                            <p className="font-medium text-lg">
                              {selectedPublication.project.projectName ?? "—"}
                            </p>
                            {selectedPublication.project.projectDescription && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {selectedPublication.project.projectDescription}
                              </p>
                            )}
                          </div>
                          {selectedPublication.project.majorName && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground">
                                Chuyên ngành:{" "}
                                {selectedPublication.project.majorName}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {selectedPublication.author && (
                      <Card>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <User className="h-4 w-4" />
                            <h3 className="font-semibold text-foreground">
                              Tác giả
                            </h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {selectedPublication.author.authorName
                                  ?.charAt(0)
                                  .toUpperCase() ?? "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">
                                {selectedPublication.author.authorName ?? "—"}
                              </p>
                              {selectedPublication.author.authorEmail && (
                                <p className="text-sm text-muted-foreground">
                                  {selectedPublication.author.authorEmail}
                                </p>
                              )}
                              {selectedPublication.author.authorPhone && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {selectedPublication.author.authorPhone}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Dates Section */}
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg mb-4">
                        Thông tin thời gian
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Ngày đăng ký
                            </span>
                          </div>
                          <p className="text-sm">
                            {formatDateTimeDisplay(
                              selectedPublication.registeredDate
                            ) ?? "—"}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Ngày xuất bản
                            </span>
                          </div>
                          <p className="text-sm">
                            {formatDateTimeDisplay(
                              selectedPublication.publishedDate
                            ) ?? "—"}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Ngày tạo
                            </span>
                          </div>
                          <p className="text-sm">
                            {formatDateTimeDisplay(
                              selectedPublication.createdAt
                            ) ?? "—"}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Ngày cập nhật
                            </span>
                          </div>
                          <p className="text-sm">
                            {formatDateTimeDisplay(
                              selectedPublication.updatedAt
                            ) ?? "—"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedPublication?.project?.projectId && (
        <ProjectDetailDialog
          open={projectDetailOpen}
          onOpenChange={(open: boolean) => {
            setProjectDetailOpen(open);
          }}
          project={
            {
              id: selectedPublication.project.projectId,
              name: selectedPublication.project.projectName ?? null,
              description:
                selectedPublication.project.projectDescription ?? null,
              type: selectedPublication.project.projectType ?? null,
              dueDate: selectedPublication.project.projectDueDate ?? null,
              ownerId: selectedPublication.project.ownerId ?? null,
              ownerName: selectedPublication.project.ownerName ?? null,
              ownerEmail: selectedPublication.project.ownerEmail ?? null,
              ownerRole: selectedPublication.project.ownerRole ?? null,
              status: selectedPublication.project.projectStatus ?? null,
            } as ProjectListItemDto
          }
          detail={projectDetail ?? null}
          isLoading={isProjectDetailLoading}
          error={null}
        />
      )}
    </>
  );
}
