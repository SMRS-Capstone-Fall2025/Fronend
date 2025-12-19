import { PublicationFormDialog } from "@/components/publication/publication-form-dialog";
import { PublicationTable } from "@/components/publication/publication-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useToast } from "@/hooks/use-toast";
import {
  CreatePublicationFormData,
  UpdatePublicationFormData,
} from "@/lib/validations/publication";
import {
  useCreatePublicationMutation,
  useDeletePublicationMutation,
  useMyPublicationsQuery,
  useUpdatePublicationMutation,
} from "@/services";
import {
  ProjectPublicationDto,
  PublicationStatus,
  PublicationType,
} from "@/services/types";
import { TablePagination } from "@/components/ui/table-pagination";
import { FileText, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import StudentLayout from "./layout";

const PUBLICATION_STATUS_OPTIONS: {
  value: PublicationStatus;
  label: string;
}[] = [
  { value: "Registered", label: "Đã đăng ký" },
  { value: "Published", label: "Đã xuất bản" },
  { value: "Cancelled", label: "Đã hủy" },
];

const PUBLICATION_TYPE_OPTIONS: { value: PublicationType; label: string }[] = [
  { value: "Journal", label: "Tạp chí" },
  { value: "Conference", label: "Hội thảo" },
];

export default function StudentPublicationsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<ProjectPublicationDto | null>(null);

  const debouncedSearch = useDebounce(searchTerm.trim(), 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });
  const {
    data: publications = [],
    isLoading,
    refetch,
  } = useMyPublicationsQuery();

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch =
          pub.publicationName?.toLowerCase().includes(searchLower) ||
          pub.project?.projectName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && pub.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && pub.publicationType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [publications, debouncedSearch, statusFilter, typeFilter]);

  const paginatedPublications = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredPublications.slice(start, end);
  }, [filteredPublications, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredPublications.length);
  }, [filteredPublications.length, pagination]);

  useEffect(() => {
    pagination.setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  const createMutation = useCreatePublicationMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã tạo publication thành công",
        variant: "success",
      });
      setCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo publication",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useUpdatePublicationMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật publication thành công",
        variant: "success",
      });
      setEditOpen(false);
      setSelectedPublication(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật publication",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useDeletePublicationMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa publication thành công",
        variant: "success",
      });
      setDeleteOpen(false);
      setSelectedPublication(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa publication",
        variant: "destructive",
      });
    },
  });

  const handleCreate = async (
    data: CreatePublicationFormData | UpdatePublicationFormData
  ) => {
    if ("projectId" in data && data.projectId) {
      await createMutation.mutateAsync(data as CreatePublicationFormData);
    }
  };

  const handleEdit = (publication: ProjectPublicationDto) => {
    setSelectedPublication(publication);
    setEditOpen(true);
  };

  const handleUpdate = async (data: UpdatePublicationFormData) => {
    if (!selectedPublication?.id) return;
    await updateMutation.mutateAsync({
      id: selectedPublication.id,
      payload: data,
    });
  };

  const handleDelete = (publication: ProjectPublicationDto) => {
    setSelectedPublication(publication);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPublication?.id) return;
    await deleteMutation.mutateAsync(selectedPublication.id);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
          <div>
              <h1 className="text-2xl font-bold text-foreground">
                Quản lý Publication
              </h1>
            <p className="text-sm text-muted-foreground">
              Tạo và quản lý các publication của bạn
            </p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo publication mới
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {PUBLICATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {PUBLICATION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PublicationTable
          publications={paginatedPublications}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={true}
          canDelete={true}
          showProject={true}
          showAuthor={false}
        />

        {filteredPublications.length > 0 && (
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
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}

        <PublicationFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          mode="create"
        />

        <PublicationFormDialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) {
              setSelectedPublication(null);
            }
          }}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
          publication={selectedPublication}
          mode="update"
        />

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa publication "
                {selectedPublication?.publicationName}"? Hành động này không thể
                hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteOpen(false);
                  setSelectedPublication(null);
                }}
                disabled={deleteMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
}
