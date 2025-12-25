import { AppShell } from "@/components/app-shell";
import Logo from "@/components/logo";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Notifications } from "@/components/notifications";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthAccountStore } from "@/lib/auth-store";
import type { NavItem } from "@/lib/types";
import { getDefaultRouteByRole, isRoleAllowed } from "@/lib/utils";
import { useMeQuery } from "@/services/account/hooks";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  TrendingUp,
  Users2,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const deanNavItems: NavItem[] = [
  {
    title: "Tổng quan",
    href: "/dean/dashboard",
    icon: LayoutDashboard,
    group: "Tổng quan",
  },
  { title: "Hội đồng", href: "/dean/councils", icon: Users2, group: "Quản lý" },
  {
    title: "Dự án",
    href: "/dean/projects",
    icon: FolderKanban,
    group: "Quản lý",
  },
  {
    title: "Quản lý báo cáo",
    href: "/dean/final-reports",
    icon: FileText,
    group: "Quản lý",
  },
  {
    title: "Quản lý Publication",
    href: "/dean/publications",
    icon: FileText,
    group: "Quản lý",
  },
  {
    title: "Nhóm hướng dẫn",
    href: "/dean/mentor-projects-performance",
    icon: TrendingUp,
    group: "Thống kê",
  },
];

const getPageTitle = (pathname: string) => {
  const item = deanNavItems.find((entry) => pathname.startsWith(entry.href));
  return item?.title ?? "Trưởng bộ môn";
};

export default function DeanLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
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

    const roleFromAccount = account?.role as string | null | undefined;

    if (!isRoleAllowed(roleFromAccount, location.pathname)) {
      const defaultRoute = getDefaultRouteByRole(roleFromAccount);
      console.warn("[DeanLayout] Redirecting:", {
        rawRole: roleFromAccount,
        expectedRole: "dean",
        defaultRoute,
      });
      navigate(defaultRoute, { replace: true });
      return;
    }
  }, [loading, meLoading, user, navigate, location.pathname, account, token]);

  if (loading || meLoading) {
    return <LoadingScreen message="Đang tải dữ liệu..." />;
  }

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <h1 className="text-base font-semibold">
              {getPageTitle(location.pathname)}
            </h1>
            <div className="flex items-center gap-2">
              <Notifications />
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 py-4 pb-20">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background md:hidden">
          <div className="flex h-16 items-center justify-around px-2">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-accent/50">
                  <Menu className="h-5 w-5" />
                  <span className="text-xs font-medium">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex h-full flex-col">
                  <div className="py-4">
                    <Logo />
                  </div>
                  <nav className="flex-1 space-y-1">
                    {deanNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.href ||
                        (item.href !== "/" &&
                          location.pathname.startsWith(item.href));
                      return (
                        <Button
                          key={item.href}
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3"
                          asChild
                          disabled={item.disabled}
                        >
                          <a href={item.href}>
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </a>
                        </Button>
                      );
                    })}
                  </nav>
                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={logout}
                    >
                      <span>Đăng xuất</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <MobileBottomNav navItems={deanNavItems} />
          </div>
        </nav>
      </div>
    );
  }

  return (
    <AppShell
      navItems={deanNavItems}
      pageTitle={getPageTitle(location.pathname)}
    >
      {children}
    </AppShell>
  );
}
