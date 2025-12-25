import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Building2,
  Mail,
  MoreVertical,
  Search,
  ShieldCheck,
  Users,
  GraduationCap,
  Briefcase,
  User,
  PhoneCall,
  Brain,
  Code,
  JapaneseYen,
  Languages,
  LineChart,
  Megaphone,
  Palette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

const roleLabelMap: Record<string, string> = {
  admin: "Quản trị viên",
  dean: "Trưởng bộ môn",
  lecturer: "Giảng viên",
  mentor: "Giảng viên",
  student: "Học sinh",
  staff: "Nhân viên",
};

const roleColorMap: Record<string, string> = {
  admin:
    "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border-transparent",
  dean: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400 border-transparent",
  lecturer:
    "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-400 border-transparent",
  mentor:
    "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-400 border-transparent",
  student:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent",
  staff:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-transparent",
  instructor:
    "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-400 border-transparent",
  teacher:
    "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-400 border-transparent",
  learner:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent",
  manager:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400 border-transparent",
  "quản trị viên":
    "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border-transparent",
  "trưởng bộ môn":
    "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400 border-transparent",
  "giảng viên":
    "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-400 border-transparent",
  "học sinh":
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent",
  "nhân viên":
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-transparent",
};

const getRoleLabel = (role: string | null | undefined): string => {
  if (!role) return "Không rõ";
  const normalized = role.trim().toLowerCase();
  return roleLabelMap[normalized] ?? role;
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

  const getMajorIcon = (
    major: { name?: string | null; code?: string | null } | null | undefined
  ): LucideIcon => {
    if (!major) return GraduationCap;

    // Map by name
    const iconMappingByName: Record<string, LucideIcon> = {
      "An toàn thông tin": ShieldCheck,
      "Công nghệ thông tin": Code,
      "Khoa học dữ liệu": LineChart,
      "Kỹ thuật phần mềm": Code,
      Marketing: Megaphone,
      "Ngôn ngữ Anh": Languages,
      "Ngôn ngữ Nhật": JapaneseYen,
      "Quản trị kinh doanh": Briefcase,
      "Thiết kế đồ họa": Palette,
      "Trí tuệ nhân tạo": Brain,
    };
    // Map by code (fallback)
    const iconMappingByCode: Record<string, LucideIcon> = {
      IA: ShieldCheck,
      IT: Code,
      DS: LineChart,
      SE: Code,
      MKT: Megaphone,
      EN: Languages,
      JP: JapaneseYen,
      BA: Briefcase,
      GD: Palette,
      AI: Brain,
    };

    const majorName = major.name ?? "";
    const majorCode = major.code?.trim().toUpperCase() ?? "";

    return (
      iconMappingByName[majorName] ||
      (majorCode && iconMappingByCode[majorCode]) ||
      GraduationCap
    );
  };

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value.trim().length > 0),
    [filters]
  );

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
              <AvatarImage
                src={account.avatar || ""}
                alt={account.name || ""}
              />
              <AvatarFallback>
                {account.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{account.name}</div>
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
          const roleValue =
            typeof account.role === "object" && account.role?.roleName
              ? account.role.roleName
              : typeof account.role === "string"
              ? account.role
              : "";
          const roleLabel = getRoleLabel(roleValue);
          return (
            <Badge
              variant="outline"
              className={cn("text-xs", getRoleBadgeClasses(roleValue))}
            >
              {roleLabel}
            </Badge>
          );
        },
      },
      {
        id: "major",
        header: "Chuyên ngành",
        render: (account) => {
          if (!account.major?.name) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          const MajorIcon = getMajorIcon(account.major);
          return (
            <div className="flex items-center gap-2">
              <MajorIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {account.major.name}
              </span>
            </div>
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
          const roleValue =
            typeof account.role === "object" && account.role?.roleName
              ? account.role.roleName
              : typeof account.role === "string"
              ? account.role
              : "";
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
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
          <div className="relative flex-1 min-w-[200px]">
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

          <Select
            value={filters.role || "all"}
            onValueChange={(value) => {
              onFilterChange("role", value === "all" ? "" : value);
            }}
          >
            <SelectTrigger id="role-filter" className="w-[150px]">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {roleFilterOptions
                .filter((option) => option.value !== "")
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(value) => {
              onFilterChange("status", value === "all" ? "" : value);
            }}
          >
            <SelectTrigger id="status-filter" className="w-[150px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
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
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-b border-blue-600/20 px-6 py-4 text-left sm:px-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <DialogHeader className="relative">
              <DialogTitle className="text-white text-2xl font-bold">
                Thông tin tài khoản
              </DialogTitle>
              <DialogDescription className="text-blue-50/90 mt-2 text-base">
                Chi tiết cơ bản của người dùng đang chọn
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedAccount ? (
            <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-background to-muted/20">
              {/* User Profile Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-border/60">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                    <AvatarImage
                      src={selectedAccount.avatar || ""}
                      alt={selectedAccount.name || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {selectedAccount.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  {!selectedAccount.locked && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {selectedAccount.name || "Không có tên"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium px-3 py-1",
                          getRoleBadgeClasses(
                            typeof selectedAccount.role === "object" &&
                              selectedAccount.role?.roleName
                              ? selectedAccount.role.roleName
                              : typeof selectedAccount.role === "string"
                              ? selectedAccount.role
                              : ""
                          )
                        )}
                      >
                        <ShieldCheck className="h-3 w-3 mr-1.5" />
                        {getRoleLabel(
                          typeof selectedAccount.role === "object" &&
                            selectedAccount.role?.roleName
                            ? selectedAccount.role.roleName
                            : typeof selectedAccount.role === "string"
                            ? selectedAccount.role
                            : ""
                        )}
                      </Badge>
                      {selectedAccount.locked ? (
                        <Badge
                          variant="destructive"
                          className="text-xs font-medium px-3 py-1"
                        >
                          Đang khóa
                        </Badge>
                      ) : (
                        <Badge className="text-xs font-medium px-3 py-1 bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                          Đang hoạt động
                        </Badge>
                      )}
                      {selectedAccount.major?.name && (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium px-3 py-1 bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30"
                        >
                          {(() => {
                            const MajorIcon = getMajorIcon(
                              selectedAccount.major
                            );
                            return (
                              <>
                                <MajorIcon className="h-3 w-3 mr-1.5" />
                                {selectedAccount.major.name}
                              </>
                            );
                          })()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Thông tin liên hệ
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Email
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {selectedAccount.email}
                      </p>
                    </div>
                  </div>
                  {selectedAccount.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Số điện thoại
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {selectedAccount.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedAccount.major && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:bg-muted/50 transition-colors sm:col-span-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Chuyên ngành
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {selectedAccount.major.name ?? "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(() => {
                const roleValue =
                  typeof selectedAccount.role === "object" &&
                  selectedAccount.role?.roleName
                    ? selectedAccount.role.roleName
                    : typeof selectedAccount.role === "string"
                    ? selectedAccount.role
                    : "";
                const normalizedRole = roleValue?.trim().toUpperCase() ?? "";
                const isDean =
                  normalizedRole === "DEAN" ||
                  normalizedRole === "TRƯỞNG BỘ MÔN";

                // Nếu là Dean, hiển thị thông tin phòng ban
                if (isDean) {
                  const department =
                    selectedAccount.councilManagerProfile?.department ||
                    selectedAccount.major?.name;
                  if (department) {
                    return (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Thông tin phòng ban
                        </h4>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-0.5">
                                Khoa/Bộ môn
                              </p>
                              <p className="text-sm font-semibold text-foreground">
                                {department}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }

                return null;
              })()}

              {selectedAccount.councilManagerProfile && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Thông tin quản lý hội đồng
                  </h4>
                  <div className="space-y-3 p-4 rounded-lg bg-card border border-border/50 shadow-sm">
                    {selectedAccount.councilManagerProfile.employeeCode && (
                      <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <span className="text-sm text-muted-foreground">
                          Mã nhân viên
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedAccount.councilManagerProfile.employeeCode}
                        </span>
                      </div>
                    )}
                    {selectedAccount.councilManagerProfile.positionTitle && (
                      <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <span className="text-sm text-muted-foreground">
                          Chức vụ
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedAccount.councilManagerProfile.positionTitle}
                        </span>
                      </div>
                    )}
                    {selectedAccount.councilManagerProfile.department && (
                      <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <span className="text-sm text-muted-foreground">
                          Khoa/Bộ môn
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedAccount.councilManagerProfile.department}
                        </span>
                      </div>
                    )}
                    {selectedAccount.councilManagerProfile.status && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">
                          Trạng thái
                        </span>
                        <Badge
                          variant={
                            selectedAccount.councilManagerProfile.status ===
                            "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs font-medium"
                        >
                          {selectedAccount.councilManagerProfile.status ===
                          "ACTIVE"
                            ? "Hoạt động"
                            : selectedAccount.councilManagerProfile.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
