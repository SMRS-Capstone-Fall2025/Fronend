import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import type { NavItem } from "@/lib/types";
import { KanbanSquare, LayoutDashboard, UserCog } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const adminNavItems: NavItem[] = [
  { title: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Quản lý dự án", href: "/admin/projects", icon: KanbanSquare },
  { title: "Quản lý người dùng", href: "/admin/users", icon: UserCog },
  // { title: "Báo cáo", href: "/admin/reports/financial", icon: BarChart },
  // {
  //   title: "Quản lý học viên",
  //   href: "/admin/students",
  //   icon: Users,
  //   disabled: true,
  // },
  // {
  //   title: "Quản lý giảng viên",
  //   href: "/admin/instructors",
  //   icon: Users,
  //   disabled: true,
  // },
  // { title: "Cài đặt", href: "/admin/settings", icon: FileText, disabled: true },
];

const getPageTitle = (pathname: string) => {
  const item = adminNavItems.find((item) => pathname.startsWith(item.href));
  return item?.title || "Quản trị";
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // if (!loading) {
    //   const token = localStorage.getItem("token");
    //   if (!token) {
    //     navigate("/login", { replace: true });
    //   }
    // }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      navItems={adminNavItems}
      pageTitle={getPageTitle(location.pathname)}
    >
      {children}
    </AppShell>
  );
}
