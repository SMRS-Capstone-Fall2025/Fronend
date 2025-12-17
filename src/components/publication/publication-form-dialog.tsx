import { ProjectSelect } from "@/components/project-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDateDisplay } from "@/lib/date-utils";
import {
  createPublicationSchema,
  updatePublicationSchema,
  type CreatePublicationFormData,
  type UpdatePublicationFormData,
} from "@/lib/validations/publication";
import { useProjectDetailQuery } from "@/services/project";
import type {
  ProjectPublicationDto,
  PublicationStatus,
  PublicationType,
} from "@/services/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, FileText, Loader2, User, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

type PublicationFormDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (
    data: CreatePublicationFormData | UpdatePublicationFormData
  ) => void | Promise<void>;
  readonly isLoading?: boolean;
  readonly publication?: ProjectPublicationDto | null;
  readonly mode?: "create" | "update";
  readonly canUpdateStatus?: boolean;
};

const PUBLICATION_TYPES: { value: PublicationType; label: string }[] = [
  { value: "Journal", label: "Tạp chí" },
  { value: "Conference", label: "Hội thảo" },
];

const PUBLICATION_STATUSES: { value: PublicationStatus; label: string }[] = [
  { value: "Registered", label: "Đã đăng ký" },
  { value: "Published", label: "Đã xuất bản" },
  { value: "Cancelled", label: "Đã hủy" },
];

export function PublicationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  publication,
  mode = "create",
}: PublicationFormDialogProps) {
  const isCreate = mode === "create";
  const schema = isCreate ? createPublicationSchema : updatePublicationSchema;

  const form = useForm<CreatePublicationFormData | UpdatePublicationFormData>({
    // @ts-expect-error - zodResolver type issue with union types
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? {
          projectId: undefined,
          publicationName: "",
          publicationType: "Journal",
          publicationLink: "",
          notes: "",
          doi: "",
          isbnIssn: "",
        }
      : {
          publicationName: "",
          publicationType: "Journal",
          publicationLink: "",
          notes: "",
          doi: "",
          isbnIssn: "",
        },
  });

  useEffect(() => {
    if (open) {
      if (isCreate) {
        form.reset({
          projectId: undefined,
          publicationName: "",
          publicationType: "Journal",
          publicationLink: "",
          notes: "",
          doi: "",
          isbnIssn: "",
        });
      } else if (publication) {
        form.reset({
          publicationName: publication.publicationName ?? "",
          publicationType:
            (publication.publicationType as PublicationType) ?? "Journal",
          publicationLink: publication.publicationLink ?? "",
          notes: publication.notes ?? "",
          doi: publication.doi ?? "",
          isbnIssn: publication.isbnIssn ?? "",
          status: (publication.status as PublicationStatus) ?? undefined,
        });
      }
    }
  }, [open, isCreate, publication, form]);

  const projectIdValue = form.watch("projectId");
  const selectedProjectId = useMemo(() => {
    if (!isCreate) return null;
    return projectIdValue ?? null;
  }, [isCreate, projectIdValue]);

  const { data: projectDetail, isLoading: isProjectDetailLoading } =
    useProjectDetailQuery(selectedProjectId, {
      enabled: isCreate && selectedProjectId != null,
    });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    if (!isLoading) {
      onOpenChange(false);
    }
  });

  const statusToLabel = (status: string | null | undefined): string => {
    switch ((status ?? "").toString().toLowerCase()) {
      case "pending":
        return "Đang chờ";
      case "inreview":
        return "Đang chấm điểm";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "inprogress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status ?? "Không rõ";
    }
  };

  const statusToBadgeConfig = (status: string | null | undefined) => {
    const normalized = (status ?? "").toString().toLowerCase();
    switch (normalized) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "inreview":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "inprogress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-hidden border border-border/60 bg-background p-0 shadow-2xl flex flex-col ${
          isCreate && selectedProjectId ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-b border-blue-600/20 px-6 py-6 text-left sm:px-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          <DialogHeader className="relative">
            <DialogTitle className="text-white text-xl font-semibold">
              {isCreate ? "Tạo publication mới" : "Cập nhật publication"}
            </DialogTitle>
            <DialogDescription className="text-blue-100/90 mt-2">
              {isCreate
                ? "Điền thông tin để tạo publication mới cho dự án của bạn"
                : "Cập nhật thông tin publication"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {isCreate && selectedProjectId && (
            <div className="w-1/2 border-r border-border/50 bg-muted/30">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  {/* <h3 className="text-lg font-semibold mb-4">
                    Thông tin dự án
                  </h3> */}
                  {isProjectDetailLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : projectDetail ? (
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-6 space-y-4">
                          <div>
                            <h4 className="font-semibold text-lg mb-2">
                              {projectDetail.name ?? "—"}
                            </h4>
                            <Badge
                              variant="outline"
                              className={statusToBadgeConfig(
                                projectDetail.status
                              )}
                            >
                              {statusToLabel(projectDetail.status)}
                            </Badge>
                          </div>

                          {projectDetail.description && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Mô tả
                              </p>
                              <p className="text-sm">
                                {projectDetail.description}
                              </p>
                            </div>
                          )}

                          <Separator />

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {projectDetail.createDate && (
                              <div>
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Ngày tạo</span>
                                </div>
                                <p>
                                  {formatDateDisplay(
                                    projectDetail.createDate
                                  ) ?? "—"}
                                </p>
                              </div>
                            )}

                            {projectDetail.dueDate && (
                              <div>
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Hạn nộp</span>
                                </div>
                                <p>
                                  {formatDateDisplay(projectDetail.dueDate) ??
                                    "—"}
                                </p>
                              </div>
                            )}
                          </div>

                          {projectDetail.owner && (
                            <>
                              <Separator />
                              <div>
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                  <User className="h-4 w-4" />
                                  <span>Chủ dự án</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {projectDetail.owner.name
                                        ?.charAt(0)
                                        .toUpperCase() ?? "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {projectDetail.owner.name ?? "—"}
                                    </p>
                                    {projectDetail.owner.email && (
                                      <p className="text-xs text-muted-foreground">
                                        {projectDetail.owner.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {projectDetail.members &&
                            projectDetail.members.length > 0 && (
                              <>
                                <Separator />
                                <div>
                                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Users className="h-4 w-4" />
                                    <span>
                                      Thành viên ({projectDetail.members.length}
                                      )
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {projectDetail.members
                                      .slice(0, 5)
                                      .map((member) => (
                                        <div
                                          key={member.id}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <Avatar className="h-7 w-7">
                                            <AvatarFallback>
                                              {member.name
                                                ?.charAt(0)
                                                .toUpperCase() ?? "U"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <p className="font-medium">
                                              {member.name ?? "—"}
                                            </p>
                                            {member.email && (
                                              <p className="text-xs text-muted-foreground">
                                                {member.email}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    {projectDetail.members.length > 5 && (
                                      <p className="text-xs text-muted-foreground">
                                        +{projectDetail.members.length - 5}{" "}
                                        thành viên khác
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}

                          {projectDetail.files &&
                            projectDetail.files.length > 0 && (
                              <>
                                <Separator />
                                <div>
                                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <FileText className="h-4 w-4" />
                                    <span>
                                      Tệp đính kèm ({projectDetail.files.length}
                                      )
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {projectDetail.files
                                      .slice(0, 3)
                                      .map((file) => (
                                        <p
                                          key={file.id}
                                          className="text-xs text-muted-foreground truncate"
                                        >
                                          {file.filePath?.split("/").pop() ??
                                            "—"}
                                        </p>
                                      ))}
                                    {projectDetail.files.length > 3 && (
                                      <p className="text-xs text-muted-foreground">
                                        +{projectDetail.files.length - 3} tệp
                                        khác
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Không tìm thấy thông tin dự án
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <div
            className={`flex-1 overflow-y-auto px-6 py-6 sm:px-10 ${
              isCreate && selectedProjectId ? "" : ""
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {isCreate && (
                <div className="space-y-2">
                  <Label htmlFor="projectId">
                    Dự án <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="projectId"
                    control={form.control}
                    render={({ field }) => (
                      <ProjectSelect
                        value={field.value?.toString()}
                        onValueChange={(value) => {
                          field.onChange(
                            value ? Number.parseInt(value, 10) : undefined
                          );
                        }}
                        placeholder="Chọn dự án"
                        disabled={isLoading}
                        queryParams={{ hasFinalReport: true }}
                      />
                    )}
                  />
                  {isCreate &&
                    "projectId" in form.formState.errors &&
                    form.formState.errors.projectId && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.projectId.message}
                      </p>
                    )}
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Lưu ý:</span> Chỉ các dự án đã
                    nộp final report mới có thể tạo publication.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="publicationName">
                  Tên publication <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="publicationName"
                  {...form.register("publicationName")}
                  placeholder="Nhập tên publication"
                  disabled={isLoading}
                />
                {form.formState.errors.publicationName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.publicationName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicationType">
                  Loại publication <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="publicationType"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại publication" />
                      </SelectTrigger>
                      <SelectContent>
                        {PUBLICATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.publicationType && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.publicationType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicationLink">Link publication</Label>
                <Input
                  id="publicationLink"
                  {...form.register("publicationLink")}
                  placeholder="https://..."
                  type="url"
                  disabled={isLoading}
                />
                {form.formState.errors.publicationLink && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.publicationLink.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input
                  id="doi"
                  {...form.register("doi")}
                  placeholder="10.xxxx/xxxxx"
                  disabled={isLoading}
                />
                {form.formState.errors.doi && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.doi.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbnIssn">ISBN/ISSN</Label>
                <Input
                  id="isbnIssn"
                  {...form.register("isbnIssn")}
                  placeholder="ISBN hoặc ISSN"
                  disabled={isLoading}
                />
                {form.formState.errors.isbnIssn && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.isbnIssn.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Nhập ghi chú (nếu có)"
                  rows={4}
                  disabled={isLoading}
                />
                {form.formState.errors.notes && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.notes.message}
                  </p>
                )}
              </div>

              {!isCreate && (
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) => {
                          field.onChange(
                            value ? (value as PublicationStatus) : undefined
                          );
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          {PUBLICATION_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {!isCreate &&
                    "status" in form.formState.errors &&
                    form.formState.errors.status && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.status.message}
                      </p>
                    )}
                </div>
              )}

              <DialogFooter className="sticky bottom-0 bg-background border-t border-border/50 px-0 py-4 -mx-6 sm:-mx-10 sm:px-10 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isCreate ? "Tạo" : "Cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
