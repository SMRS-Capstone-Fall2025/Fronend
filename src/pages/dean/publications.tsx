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
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useToast } from "@/hooks/use-toast";
import { useAuthAccountStore } from "@/lib/auth-store";
import {
  useAllPublicationsQuery,
  useDeletePublicationMutation,
  useUpdatePublicationMutation,
} from "@/services";
import type {
  ProjectPublicationDto,
  PublicationStatus,
  UpdatePublicationFormData,
} from "@/services/types";
import { BookOpen, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DeanLayout from "./layout";

const PUBLICATION_STATUS_OPTIONS: {
  value: PublicationStatus;
  label: string;
}[] = [
  { value: "Registered", label: "Đã đăng ký" },
  { value: "Published", label: "Đã xuất bản" },
  { value: "Cancelled", label: "Đã hủy" },
];

export default function DeanPublicationsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<ProjectPublicationDto | null>(null);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 10 });

  const account = useAuthAccountStore((state) => state.account);
  const deanMajorId = account?.major?.id;

  const {
    data: allPublications = [],
    isLoading,
    refetch,
  } = useAllPublicationsQuery();

  const filteredPublications = useMemo(() => {
    let filtered = allPublications;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((pub) => pub.status === statusFilter);
    }

    // Filter by search term
    if (debouncedSearch.trim()) {
      const keyword = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter((pub) => {
        const searchFields = [
          pub.publicationName,
          pub.publicationType,
          pub.publisher,
          pub.isbn,
          pub.doi,
          pub.project?.projectName,
          pub.authorName,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        return searchFields.some((field) => field.includes(keyword));
      });
    }

    return filtered;
  }, [allPublications, statusFilter, debouncedSearch]);

  const paginatedPublications = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredPublications.slice(start, end);
  }, [filteredPublications, pagination.page, pagination.pageSize]);

  useEffect(() => {
    pagination.setTotalItems(filteredPublications.length);
  }, [filteredPublications.length]);

  useEffect(() => {
    pagination.setPage(1);
  }, [debouncedSearch, statusFilter]);

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

  // Check if publication has same major as dean
  const canEditPublication = (publication: ProjectPublicationDto): boolean => {
    if (!deanMajorId) return true; // If dean has no major, allow edit
    return publication.project?.majorId === deanMajorId;
  };

  const handleEdit = (publication: ProjectPublicationDto) => {
    // Check if publication has same major as dean
    if (!canEditPublication(publication)) {
      toast({
        title: "Không thể chỉnh sửa",
        description:
          "Bạn chỉ có thể cập nhật publication của dự án cùng chuyên ngành với bạn.",
        variant: "destructive",
      });
      return;
    }
    setSelectedPublication(publication);
    setEditOpen(true);
  };

  const handleUpdate = async (data: UpdatePublicationFormData) => {
    if (!selectedPublication?.id) return;
    
    // Double check: ensure publication has same major as dean
    if (!canEditPublication(selectedPublication)) {
      toast({
        title: "Không thể cập nhật",
        description:
          "Bạn chỉ có thể cập nhật publication của dự án cùng chuyên ngành với bạn.",
        variant: "destructive",
      });
      setEditOpen(false);
      setSelectedPublication(null);
      return;
    }
    
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
    <DeanLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Quản lý Publication
              </h1>
              <p className="text-sm text-muted-foreground">
                Quản lý tất cả các publication trong hệ thống
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                const value = event.target.value;
                setSearchTerm(value);
              }}
              className="pl-9"
              placeholder="Tìm kiếm theo tên, loại, nhà xuất bản, ISBN, DOI, tác giả..."
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {PUBLICATION_STATUS_OPTIONS.map((option) => (
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
          showAuthor={true}
          page={pagination.page}
          pageSize={pagination.pageSize}
          canEditPublication={canEditPublication}
        />

        {filteredPublications.length > 0 && (
          <div className="pt-4">
            <TablePagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={filteredPublications.length}
              totalPages={pagination.totalPages}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              isLoading={isLoading}
              onPrevious={() => pagination.previousPage()}
              onNext={() => pagination.nextPage()}
              onPageChange={(p) => pagination.setPage(p)}
              onPageSizeChange={(s) => pagination.setPageSize(s)}
            />
          </div>
        )}

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
          canUpdateStatus={true}
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
    </DeanLayout>
  );
}
