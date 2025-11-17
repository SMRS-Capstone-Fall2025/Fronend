import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import DeanLayout from "./layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CouncilTable } from "@/components/dean/council-table";
import { CouncilDetailsDialog } from "@/components/dean/council-details-dialog";
import { CouncilUpsertDialog } from "@/components/dean/council-upsert-dialog";
import {
  useCouncilListQuery,
  useCreateCouncilMutation,
  useUpdateCouncilMutation,
  useDeleteCouncilMutation,
} from "@/services/council/hooks";
import type { CouncilDto } from "@/services/types";
import type { CouncilFormValues } from "@/components/dean/council-form";
import { useToast } from "@/hooks/use-toast";
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

function DeanCouncilsPageContent() {
  const { data: councils = [], isLoading } = useCouncilListQuery();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState<CouncilDto | null>(
    null
  );
  const [editingCouncil, setEditingCouncil] = useState<CouncilDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CouncilDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Tạo hội đồng thất bại",
        description: error?.message ?? "Vui lòng thử lại sau.",
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
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Cập nhật không thành công",
        description:
          error?.message ?? "Không thể lưu thay đổi, vui lòng thử lại.",
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
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Không thể xóa hội đồng",
        description: error?.message ?? "Vui lòng thử lại sau.",
      });
    },
  });

  const filteredCouncils = useMemo(() => {
    if (!searchTerm.trim()) return councils;
    const keyword = searchTerm.trim().toLowerCase();
    return councils.filter((council) => {
      const sources = [
        council.councilCode?.toLowerCase(),
        council.councilName?.toLowerCase(),
        council.department?.toLowerCase(),
      ];
      return sources.some((value) => value?.includes(keyword));
    });
  }, [councils, searchTerm]);

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
      // Handled by mutation onError; suppress console noise.
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
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Quản lý hội đồng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo và quản lý các hội đồng chấm điểm dự án, phân công giảng viên
            theo email.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tạo hội đồng
        </Button>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9"
            placeholder="Tìm theo mã, tên hội đồng hoặc khoa"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Tổng số:{" "}
          <span className="font-semibold text-foreground">
            {councils.length}
          </span>{" "}
          hội đồng
        </p>
      </div>

      <CouncilTable
        councils={filteredCouncils}
        isLoading={isLoading}
        onView={(council) => {
          setSelectedCouncil(council);
          setDetailOpen(true);
        }}
        onEdit={handleEdit}
      />

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

export default function DeanCouncilsPage() {
  return (
    <DeanLayout>
      <DeanCouncilsPageContent />
    </DeanLayout>
  );
}
