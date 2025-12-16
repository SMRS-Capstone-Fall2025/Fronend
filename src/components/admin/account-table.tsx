import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import type { PaginationState } from "@/hooks/use-pagination";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useActivateAccountMutation, useLockAccountMutation } from "@/services";
import type { AccountDto } from "@/services/types";
import {
  Filter,
  Mail,
  MoreVertical,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const roleColorMap: Record<string, string> = {
  admin: "bg-rose-100 text-rose-800 border-transparent",
  "quản trị viên": "bg-rose-100 text-rose-800 border-transparent",
  staff: "bg-amber-100 text-amber-800 border-transparent",
  "nhân viên": "bg-amber-100 text-amber-800 border-transparent",
  instructor: "bg-sky-100 text-sky-800 border-transparent",
  "giảng viên": "bg-sky-100 text-sky-800 border-transparent",
  teacher: "bg-sky-100 text-sky-800 border-transparent",
  student: "bg-emerald-100 text-emerald-800 border-transparent",
  "học viên": "bg-emerald-100 text-emerald-800 border-transparent",
  learner: "bg-emerald-100 text-emerald-800 border-transparent",
  manager: "bg-indigo-100 text-indigo-800 border-transparent",
};

const getRoleBadgeClasses = (role: string | null | undefined) => {
  const normalized = role?.trim().toLowerCase();

  if (!normalized) {
    return "bg-muted text-muted-foreground border-transparent";
  }

  return (
    roleColorMap[normalized] ??
    "bg-muted text-muted-foreground border-transparent"
  );
};

type AccountFilters = {
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
};

type AccountTableProps = {
  readonly accounts: AccountDto[];
  readonly filters: AccountFilters;
  readonly isLoading?: boolean;
  readonly isFetching?: boolean;
  readonly pagination: PaginationState;
  readonly pageSizeOptions?: ReadonlyArray<number>;
  readonly onFilterChange: (
    filterId: keyof AccountFilters,
    value: string
  ) => void;
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly onPageChange?: (page: number) => void;
};

export function AccountTable({
  accounts,
  filters,
  isLoading,
  isFetching,
  pagination,
  pageSizeOptions,
  onFilterChange,
  onPageSizeChange,
  onPageChange,
}: AccountTableProps) {
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    startItem,
    endItem,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
  } = pagination;

  const { toast } = useToast();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(
    null
  );

  const openDetail = (account: AccountDto) => {
    setSelectedAccount(account);
    setDetailOpen(true);
  };
  const lockMutation = useLockAccountMutation({
    onSuccess: () => {
      toast({ title: "Tài khoản đã bị khóa", variant: "success" });
    },
    onError: () => {
      toast({
        title: "Không thể khóa tài khoản",
        variant: "destructive",
      });
    },
  });

  const activateMutation = useActivateAccountMutation({
    onSuccess: () => {
      toast({ title: "Tài khoản đã được kích hoạt", variant: "success" });
    },
    onError: () => {
      toast({
        title: "Không thể kích hoạt tài khoản",
        variant: "destructive",
      });
    },
  });

  const roleFilterOptions = useMemo(() => {
    return [
      {
        value: "ADMIN",
        label: "Quản trị viên",
      },
      { value: "STUDENT", label: "Học sinh" },
      {
        value: "LECTURER",
        label: "Giảng viên",
      },
      { value: "DEAN", label: "Trưởng bộ môn" },
    ];
  }, []);

  const statusFilterOptions = [
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "LOCKED", label: "Bị khóa" },
  ];

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value.trim().length > 0),
    [filters]
  );

  const handleClearFilters = () => {
    onFilterChange("name", "");
    onFilterChange("email", "");
    onFilterChange("role", "");
    onFilterChange("status", "");
  };

  const columns: DataTableColumn<AccountDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => {
          const globalIndex =
            (pagination.page - 1) * pagination.pageSize + index + 1;
          return <span className="text-muted-foreground">{globalIndex}</span>;
        },
      },
      {
        id: "account",
        header: "Tài khoản",
        render: (account) => (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {account.fullName?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{account.fullName}</div>
              <div className="text-sm text-muted-foreground">
                {account.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "role",
        header: "Vai trò",
        render: (account) => {
          const roleValue = typeof account.role === "object" && account.role?.roleName
            ? account.role.roleName
            : (typeof account.role === "string" ? account.role : "");
          return (
            <Badge
              variant="outline"
              className={cn(
                "text-xs uppercase",
                getRoleBadgeClasses(roleValue)
              )}
            >
              {roleValue}
            </Badge>
          );
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        render: (account) =>
          account.locked ? (
            <Badge variant="destructive" className="text-xs">
              Khóa
            </Badge>
          ) : (
            <Badge className="text-xs bg-emerald-100 text-emerald-800 border-transparent">
              Hoạt động
            </Badge>
          ),
      },
      {
        id: "actions",
        header: "Hành động",
        render: (account) => {
          const roleValue = typeof account.role === "object" && account.role?.roleName
            ? account.role.roleName
            : (typeof account.role === "string" ? account.role : "");
          const normalizedRole = roleValue?.trim().toUpperCase() ?? "";
          const isAdminRole = normalizedRole === "ADMIN";
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44" forceMount>
                <DropdownMenuItem onSelect={() => openDetail(account)}>
                  Xem chi tiết
                </DropdownMenuItem>
                {!isAdminRole && (
                  <>
                    <DropdownMenuSeparator />
                    {account.locked ? (
                      <DropdownMenuItem
                        onSelect={() => activateMutation.mutate(account.id)}
                        className="text-emerald-600"
                      >
                        Kích hoạt
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onSelect={() => lockMutation.mutate(account.id)}
                        className="text-destructive"
                      >
                        Khóa
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [pagination.page, pagination.pageSize, activateMutation, lockMutation]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.name}
                onChange={(event) => {
                  onFilterChange("name", event.target.value);
                }}
                className="pl-9"
                placeholder="Lọc theo họ tên"
              />
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.email}
                onChange={(event) => {
                  onFilterChange("email", event.target.value);
                }}
                className="pl-9"
                placeholder="Lọc theo email"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
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
              htmlFor="role-filter"
              className="text-sm text-muted-foreground"
            >
              Vai trò:
            </label>
            <Select
              value={filters.role || ""}
              onValueChange={(value) => {
                onFilterChange("role", value === "" ? "" : value);
              }}
            >
              <SelectTrigger id="role-filter" className="w-[150px]">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roleFilterOptions
                  .filter((option) => option.value !== "")
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="text-sm text-muted-foreground"
            >
              Trạng thái:
            </label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) => {
                onFilterChange("status", value === "" ? "" : value);
              }}
            >
              <SelectTrigger id="status-filter" className="w-[150px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions
                  .filter((option) => option.value !== "")
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="ml-auto flex flex-wrap gap-2">
              {filters.role && (
                <Badge variant="secondary" className="gap-1">
                  Vai trò:{" "}
                  {roleFilterOptions.find((opt) => opt.value === filters.role)
                    ?.label ?? filters.role}
                  <button
                    onClick={() => onFilterChange("role", "")}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  Trạng thái:{" "}
                  {statusFilterOptions.find(
                    (opt) => opt.value === filters.status
                  )?.label ?? filters.status}
                  <button
                    onClick={() => onFilterChange("status", "")}
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

      <DataTable
        columns={columns}
        data={accounts}
        isLoading={isLoading || (isFetching && accounts.length === 0)}
        emptyMessage={
          hasActiveFilters
            ? "Không tìm thấy tài khoản phù hợp. Vui lòng thử bộ lọc khác."
            : "Chưa có tài khoản nào trong hệ thống."
        }
        emptyIcon={<Users className="h-12 w-12 mx-auto mb-3 opacity-50" />}
        keyExtractor={(account) => account.id}
      />

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        isLoading={isLoading}
        isFetching={isFetching}
        onNext={nextPage}
        onPrevious={previousPage}
        onPageChange={onPageChange ?? ((p: number) => pagination.setPage(p))}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedAccount(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin tài khoản</DialogTitle>
            <DialogDescription>
              Chi tiết cơ bản của người dùng đang chọn.
            </DialogDescription>
          </DialogHeader>

          {selectedAccount ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-base font-semibold">
                    {selectedAccount.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {selectedAccount.fullName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs uppercase",
                        getRoleBadgeClasses(
                          typeof selectedAccount.role === "object" && selectedAccount.role?.roleName
                            ? selectedAccount.role.roleName
                            : (typeof selectedAccount.role === "string" ? selectedAccount.role : "")
                        )
                      )}
                    >
                      {typeof selectedAccount.role === "object" && selectedAccount.role?.roleName
                        ? selectedAccount.role.roleName
                        : (typeof selectedAccount.role === "string" ? selectedAccount.role : "Không rõ")}
                    </Badge>
                    {selectedAccount.locked ? (
                      <Badge variant="destructive" className="text-xs">
                        Đang khóa
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-emerald-100 text-emerald-800 border-transparent">
                        Đang hoạt động
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-border/70 bg-muted/10 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAccount.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Vai trò:{" "}
                    {typeof selectedAccount.role === "object" && selectedAccount.role?.roleName
                      ? selectedAccount.role.roleName
                      : (typeof selectedAccount.role === "string" ? selectedAccount.role : "Không rõ")}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
