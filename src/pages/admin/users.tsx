import AccountImportModal from "@/components/admin/account-import-modal";
import { AccountTable } from "@/components/admin/account-table";

import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useAccountsListQuery } from "@/services";
import type { AccountDto } from "@/services/types";
import { Upload, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./layout";

type AccountFiltersState = {
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
};

const defaultFilters: AccountFiltersState = {
  name: "",
  email: "",
  role: "",
  status: "",
};

function UsersManagementPage() {
  const [filters, setFilters] = useState<AccountFiltersState>(defaultFilters);
  const debouncedFilters = useDebounce(filters, 300);
  const pagination = usePagination({ initialPage: 1, initialPageSize: 5 });

  const { data, isLoading, isFetching } = useAccountsListQuery({
    page: pagination.page,
    size: pagination.pageSize,
    name: debouncedFilters.name,
    email: debouncedFilters.email,
    role: debouncedFilters.role,
    status: debouncedFilters.status,
  });

  const [importOpen, setImportOpen] = useState(false);

  const accounts = useMemo<AccountDto[]>(() => {
    const items = data?.data?.items ?? [];
    return items.map((it) => {
      const roleValue =
        typeof it.role === "object" && it.role?.roleName
          ? it.role.roleName
          : typeof it.role === "string"
          ? it.role
          : "";

      return {
        role: roleValue,
        ...it,
      };
    });
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
      <div className="space-y-2 flex justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <UserCog className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              Quản lý tài khoản
            </h1>
            <p className="text-sm text-muted-foreground">
              Tìm kiếm và quản lý danh sách tài khoản trong hệ thống
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => setImportOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Import người dùng
          </Button>
        </div>
      </div>

      <AccountTable
        accounts={accounts}
        filters={filters}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
        pageSizeOptions={[4, 10, 25, 50]}
        onFilterChange={(filterId, value) => {
          setFilters((prev) => ({ ...prev, [filterId]: value }));
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
