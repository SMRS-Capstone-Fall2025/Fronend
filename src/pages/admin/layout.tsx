import { AppShell } from "@/components/app-shell";
import { LoadingScreen } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
import { useAuthAccountStore } from "@/lib/auth-store";
import type { NavItem } from "@/lib/types";
import { getDefaultRouteByRole, isRoleAllowed } from "@/lib/utils";
import { useMeQuery } from "@/services/account/hooks";
import {
  Activity,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  UserCog,
  Users2,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const adminNavItems: NavItem[] = [
  {
    title: "Tổng quan",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    group: "Tổng quan",
  },
  {
    title: "Quản lý dự án",
    href: "/admin/projects",
    icon: KanbanSquare,
    group: "Quản lý",
  },
  {
    title: "Quản lý hội đồng",
    href: "/admin/councils",
    icon: Users2,
    group: "Quản lý",
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: UserCog,
    group: "Quản lý",
  },
  {
    title: "Quản lý Publication",
    href: "/admin/publications",
    icon: FileText,
    group: "Quản lý",
  },
  {
    title: "Hoạt động gần đây",
    href: "/admin/activities",
    icon: Activity,
    group: "Khác",
  },
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
  const account = useAuthAccountStore((s) => s.account);

  const token = localStorage.getItem("token");
  const { isLoading: meLoading } = useMeQuery({
    enabled: Boolean(token),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {

    if (loading || meLoading) return;

    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }

    const roleFromAccount = account?.role;

    const rawRole = roleFromAccount;

    if (!isRoleAllowed(rawRole, location.pathname)) {
      const defaultRoute = getDefaultRouteByRole(rawRole);
      console.warn("[AdminLayout] Redirecting:", {
        expectedRole: "admin",
        defaultRoute,
      });
      navigate(defaultRoute, { replace: true });
      return;
    }
  }, [user, loading, meLoading, navigate, location.pathname, account, token]);

  if (loading || meLoading) {
    return <LoadingScreen message="Đang tải dữ liệu..." />;
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
