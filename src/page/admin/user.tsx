import { AccountTable } from "@/components/admin/account-table";
import AccountImportModal from "@/components/admin/account-import-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// (no debounce needed for server-side list endpoint)
import { usePagination } from "@/hooks/use-pagination";
import { useAccountsListQuery } from "@/services";
import type { AccountDto } from "@/services/types";
import AdminLayout from "./layout";
import { useEffect, useMemo, useState } from "react";

function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const { data, isLoading, isFetching } = useAccountsListQuery({
    page: pagination.page,
    size: pagination.pageSize,
  });

  const [importOpen, setImportOpen] = useState(false);

  const accounts = useMemo<AccountDto[]>(() => {
    const items = data?.data?.items ?? [];
    return items.map((it) => ({
      id: it.id,
      email: it.email,
      fullName: it.name ?? it.fullName ?? "",
      roleName: it.role?.roleName ?? it.roleName ?? "",
      createdAt: it.createdAt ?? "",
      locked: it.locked ?? false,
    }));
  }, [data]);

  const totalItems = data?.data?.totalItems ?? 0;
  const { setTotalItems } = pagination;

  useEffect(() => {
    if (totalItems) {
      setTotalItems(totalItems);
    }
  }, [setTotalItems, totalItems]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <p className="text-muted-foreground">
          Tìm kiếm và quản lý danh sách tài khoản trong hệ thống
        </p>
      </div>

      <AccountTable
        accounts={accounts}
        keyword={searchTerm}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
        pageSizeOptions={[4, 10, 25, 50]}
        onKeywordChange={(value) => {
          setSearchTerm(value);
          pagination.setPage(1);
        }}
        onPageSizeChange={(value) => {
          pagination.setPageSize(value);
        }}
      />
      <AccountImportModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <UsersManagementPage />
    </AdminLayout>
  );
}
