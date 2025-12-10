import { CouncilDetailsDialog } from "@/components/dean/council-details-dialog";
import type { CouncilFormValues } from "@/components/dean/council-form";
import { CouncilTable } from "@/components/dean/council-table";
import { CouncilUpsertDialog } from "@/components/dean/council-upsert-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { councilService } from "@/services";
import {
  useCouncilListQuery,
  useCreateCouncilMutation,
  useDeleteCouncilMutation,
  useRemoveMemberFromCouncilMutation,
  useUpdateCouncilMutation,
} from "@/services/council/hooks";
import { useMajorsQuery } from "@/services/major/hooks";
import type { CouncilDto, CouncilStatus } from "@/services/types";
import { Filter, GraduationCap, Plus, Search, Users2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type FilterState = {
  search: string;
  status: CouncilStatus | "all";
  department: string | "all";
};

export function CouncilsManagement() {
  const { data: councils = [], isLoading } = useCouncilListQuery();
  const { data: majors = [], isLoading: isLoadingMajors } = useMajorsQuery();
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    department: "all",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState<CouncilDto | null>(
    null
  );
  const [editingCouncil, setEditingCouncil] = useState<CouncilDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CouncilDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 5,
  });

  const createMutation = useCreateCouncilMutation({
    onSuccess: (data) => {
      setIsCreateOpen(false);
      toast({
        title: "Đã tạo hội đồng",
        description: `Hội đồng ${
          data.councilName ?? "mới"
        } đã được tạo thành công.`,
      });
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Vui lòng thử lại sau.");
      console.error("Create council error:", error);
      toast({
        variant: "destructive",
        title: "Tạo hội đồng thất bại",
        description: errorMessage,
      });
    },
  });

  const updateMutation = useUpdateCouncilMutation({
    onSuccess: (data) => {
      setIsEditOpen(false);
      setEditingCouncil(null);
      toast({
        title: "Đã cập nhật hội đồng",
        description: `Thông tin hội đồng ${
          data.councilName ?? ""
        } đã được lưu.`,
      });
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Không thể lưu thay đổi, vui lòng thử lại."
      );
      console.error("Update council error:", error);
      toast({
        variant: "destructive",
        title: "Cập nhật không thành công",
        description: errorMessage,
      });
    },
  });

  const deleteMutation = useDeleteCouncilMutation({
    onSuccess: () => {
      toast({
        title: "Đã xóa hội đồng",
        description: "Hội đồng đã được xóa khỏi danh sách.",
      });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setIsEditOpen(false);
      setEditingCouncil(null);
      if (
        selectedCouncil &&
        deleteTarget &&
        selectedCouncil.id === deleteTarget.id
      ) {
        setDetailOpen(false);
        setSelectedCouncil(null);
      }
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Vui lòng thử lại sau.");
      console.error("Delete council error:", error);
      toast({
        variant: "destructive",
        title: "Không thể xóa hội đồng",
        description: errorMessage,
      });
    },
  });

  const removeMemberMutation = useRemoveMemberFromCouncilMutation({
    onSuccess: async () => {
      toast({
        title: "Đã xóa giảng viên",
        description: "Giảng viên đã được xóa khỏi hội đồng.",
      });

      if (selectedCouncil) {
        try {
          const updatedCouncil = await councilService.getDetail(
            selectedCouncil.id
          );
          if (updatedCouncil) {
            setSelectedCouncil(updatedCouncil);
          }
        } catch (error) {
          console.error("Failed to refresh council detail:", error);
        }
      }
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Vui lòng thử lại sau.");
      console.error("Remove member error:", error);
      toast({
        variant: "destructive",
        title: "Không thể xóa giảng viên",
        description: errorMessage,
      });
    },
  });

  const activeMajors = useMemo(() => {
    return majors
      .filter((major) => major.isActive !== false && major.name)
      .sort((a, b) => {
        const nameA = a.name ?? "";
        const nameB = b.name ?? "";
        return nameA.localeCompare(nameB);
      });
  }, [majors]);

  const statuses: CouncilStatus[] = useMemo(() => {
    const statusSet = new Set<CouncilStatus>();
    councils.forEach((council) => {
      if (council.status) {
        statusSet.add(council.status);
      }
    });
    return Array.from(statusSet).sort();
  }, [councils]);

  const filteredCouncils = useMemo(() => {
    let result = councils;

    if (filters.search.trim()) {
      const keyword = filters.search.trim().toLowerCase();
      result = result.filter((council) => {
        const sources = [
          council.councilCode?.toLowerCase(),
          council.councilName?.toLowerCase(),
          council.department?.toLowerCase(),
        ];
        return sources.some((value) => value?.includes(keyword));
      });
    }

    if (filters.status !== "all") {
      result = result.filter((council) => council.status === filters.status);
    }

    if (filters.department && filters.department !== "all") {
      result = result.filter(
        (council) => council.department?.trim() === filters.department
      );
    }

    return result;
  }, [councils, filters]);

  const paginatedCouncils = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredCouncils.slice(start, end);
  }, [filteredCouncils, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredCouncils.length);
  }, [filteredCouncils.length, pagination]);

  useEffect(() => {
    if (pagination.page > 1) {
      pagination.setPage(1);
    }
  }, [filters.search, filters.status, filters.department]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.department !== "all";

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      department: "all",
    });
  };

  const handleCreate = async (values: CouncilFormValues) => {
    try {
      await createMutation.mutateAsync({
        councilCode: values.councilCode,
        councilName: values.councilName,
        department: values.department || null,
        description: values.description || null,
        lecturerEmails: values.lecturerEmails,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (council: CouncilDto) => {
    setDetailOpen(false);
    setSelectedCouncil(null);
    setEditingCouncil(council);
    setIsEditOpen(true);
  };

  const handleUpdate = async (values: CouncilFormValues) => {
    if (!editingCouncil) return;
    try {
      await updateMutation.mutateAsync({
        id: editingCouncil.id,
        councilCode: values.councilCode,
        councilName: values.councilName,
        department: values.department || null,
        description: values.description || null,
        lecturerEmails: values.lecturerEmails,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openDeleteDialog = (council: CouncilDto) => {
    setDeleteTarget(council);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedCouncilInitialValues: Partial<CouncilFormValues> | undefined =
    editingCouncil
      ? {
          councilCode: editingCouncil.councilCode ?? "",
          councilName: editingCouncil.councilName ?? "",
          department: editingCouncil.department ?? "",
          description: editingCouncil.description ?? "",
          lecturerEmails:
            editingCouncil.members
              .map((member) => member.lecturerEmail)
              .filter((email): email is string => Boolean(email)) ?? [],
        }
      : undefined;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Users2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Quản lý hội đồng
              </h1>
              <p className="text-sm text-muted-foreground">
                Tạo và quản lý các hội đồng chấm điểm dự án, phân công giảng
                viên theo email.
              </p>
            </div>
          </div>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tạo hội đồng
        </Button>
      </header>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(event) => {
                const value = event.target.value;
                setFilters((prev) => ({ ...prev, search: value }));
              }}
              className="pl-9"
              placeholder="Tìm theo mã, tên hội đồng hoặc khoa"
            />
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Bộ lọc:</span>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="text-sm text-muted-foreground"
            >
              Trạng thái:
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value as CouncilStatus | "all",
                }))
              }
            >
              <SelectTrigger id="status-filter" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="department-filter"
              className="text-sm text-muted-foreground"
            >
              Khoa / Bộ môn:
            </label>
            <Select
              value={filters.department}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  department: value as string | "all",
                }))
              }
              disabled={isLoadingMajors}
            >
              <SelectTrigger id="department-filter" className="w-[200px]">
                <SelectValue placeholder="Tất cả khoa / bộ môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khoa / bộ môn</SelectItem>
                {activeMajors.map((major) => {
                  const majorName = major.name ?? "";
                  if (!majorName) return null;
                  return (
                    <SelectItem key={major.id} value={majorName}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>{majorName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="ml-auto flex flex-wrap gap-2">
              {filters.status !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Trạng thái: {filters.status}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, status: "all" }))
                    }
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.department && filters.department !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Khoa: {filters.department}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, department: "all" }))
                    }
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <CouncilTable
        councils={paginatedCouncils}
        isLoading={isLoading}
        onView={(council) => {
          setSelectedCouncil(council);
          setDetailOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={openDeleteDialog}
      />

      {filteredCouncils.length > 0 && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          hasNext={pagination.hasNext}
          hasPrevious={pagination.hasPrevious}
          isLoading={isLoading}
          onPrevious={pagination.previousPage}
          onNext={pagination.nextPage}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}

      <CouncilDetailsDialog
        open={detailOpen}
        council={selectedCouncil ?? undefined}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedCouncil(null);
          }
        }}
        onEdit={(council) => {
          setDetailOpen(false);
          handleEdit(council);
        }}
        onRemoveMember={(councilId, lecturerId) => {
          removeMemberMutation.mutate({ councilId, lecturerId });
        }}
        isRemovingMember={removeMemberMutation.isPending}
      />

      <CouncilUpsertDialog
        open={isCreateOpen}
        mode="create"
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        submitting={createMutation.isPending}
      />

      <CouncilUpsertDialog
        open={isEditOpen}
        mode="edit"
        initialValues={selectedCouncilInitialValues}
        submitting={updateMutation.isPending || deleteMutation.isPending}
        onSubmit={handleUpdate}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingCouncil(null);
          }
        }}
        onDelete={() => {
          if (editingCouncil) {
            openDeleteDialog(editingCouncil);
          }
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hội đồng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Hội đồng sẽ bị xóa khỏi hệ thống
              và không thể phân công cho dự án.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
