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
import { useToast } from "@/hooks/use-toast";
import { UpdatePublicationFormData } from "@/lib/validations/publication";
import {
  useAllPublicationsQuery,
  useDeletePublicationMutation,
  useUpdatePublicationMutation,
} from "@/services";
import type {
  ProjectPublicationDto,
  PublicationStatus,
  PublicationType,
} from "@/services/types";
import { FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import AdminLayout from "./layout";

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

export default function AdminPublicationsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<ProjectPublicationDto | null>(null);

  const debouncedSearch = useDebounce(searchTerm.trim(), 300);
  const {
    data: allPublications = [],
    isLoading,
    refetch,
  } = useAllPublicationsQuery();

  const filteredPublications = useMemo(() => {
    return allPublications.filter((pub) => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch =
          pub.publicationName?.toLowerCase().includes(searchLower) ||
          pub.project?.projectName?.toLowerCase().includes(searchLower) ||
          pub.author?.authorName?.toLowerCase().includes(searchLower);
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
  }, [allPublications, debouncedSearch, statusFilter, typeFilter]);

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
    <AdminLayout>
      <div className="space-y-6">
        <div className="space-y-2 flex justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Quản lý Publication
              </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý tất cả các publication trong hệ thống
            </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, dự án, tác giả..."
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
          publications={filteredPublications}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={true}
          canDelete={true}
          showProject={true}
          showAuthor={true}
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
    </AdminLayout>
  );
}
