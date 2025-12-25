import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { TopUserDto } from "@/services/admin-stats";
import { Award, Medal, Trophy, Users } from "lucide-react";
import { useMemo } from "react";

interface AdminTopUsersTableProps {
  data?: readonly TopUserDto[];
  isLoading?: boolean;
}

const roleLabelMap: Record<string, string> = {
  admin: "Quản trị viên",
  dean: "Trưởng bộ môn",
  lecturer: "Giảng viên",
  mentor: "Giảng viên",
  student: "Học sinh",
  staff: "Nhân viên",
  ADMIN: "Quản trị viên",
  DEAN: "Trưởng bộ môn",
  LECTURER: "Giảng viên",
  MENTOR: "Giảng viên",
  STUDENT: "Học sinh",
  STAFF: "Nhân viên",
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
  ADMIN:
    "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border-transparent",
  DEAN: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400 border-transparent",
  LECTURER:
    "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-400 border-transparent",
  MENTOR:
    "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-400 border-transparent",
  STUDENT:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent",
  STAFF:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-transparent",
};

const getRoleLabel = (role: string | null | undefined): string => {
  if (!role) return "—";
  const normalized = role.trim().toLowerCase();
  return roleLabelMap[normalized] ?? roleLabelMap[role] ?? role;
};

const getRoleBadgeClasses = (role: string | null | undefined): string => {
  if (!role) return "";
  const normalized = role.trim().toLowerCase();
  return (
    roleColorMap[normalized] ??
    roleColorMap[role] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400 border-transparent"
  );
};

const getRankIcon = (index: number) => {
  if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />;
  if (index === 2) return <Award className="h-4 w-4 text-amber-600" />;
  return (
    <span className="text-sm font-medium text-muted-foreground">
      #{index + 1}
    </span>
  );
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-500";
  if (score >= 80) return "bg-blue-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-orange-500";
};

export function AdminTopUsersTable({
  data,
  isLoading,
}: AdminTopUsersTableProps) {
  const columns: DataTableColumn<TopUserDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        headerClassName: "text-center",
        className: "text-center w-16",
        render: (_, index) => (
          <span className="text-muted-foreground">{index + 1}</span>
        ),
      },
      {
        id: "rank",
        header: "Hạng",
        className: "w-16 text-center",
        render: (_, index) => (
          <div className="flex items-center justify-center">
            {getRankIcon(index)}
          </div>
        ),
      },
      {
        id: "userName",
        header: "Họ tên",
        render: (user) => <span className="font-medium">{user.userName}</span>,
      },
      {
        id: "userEmail",
        header: "Email",
        render: (user) => (
          <span className="text-muted-foreground">{user.userEmail}</span>
        ),
      },
      {
        id: "role",
        header: "Vai trò",
        render: (user) => {
          const roleValue = user.role || "";
          const roleLabel = getRoleLabel(roleValue);
          const badgeClasses = getRoleBadgeClasses(roleValue);
          return (
            <Badge
              variant="outline"
              className={cn("text-xs", badgeClasses)}
            >
              {roleLabel}
            </Badge>
          );
        },
      },
      {
        id: "projectsCount",
        header: "Số dự án",
        className: "text-center",
        render: (user) => <span>{user.projectsCount}</span>,
      },
      {
        id: "averageScore",
        header: "Điểm TB",
        className: "text-center",
        render: (user) => (
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold">
              {user.averageScore.toFixed(1)}
            </span>
            <div
              className={`h-2 w-2 rounded-full ${getScoreColor(
                user.averageScore
              )}`}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top sinh viên có điểm cao nhất</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          emptyMessage="Không có dữ liệu"
          emptyIcon={<Users className="h-12 w-12 mx-auto mb-3 opacity-50" />}
          keyExtractor={(user) => String(user.userId)}
        />
      </CardContent>
    </Card>
  );
}
