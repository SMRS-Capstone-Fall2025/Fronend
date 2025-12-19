import Logo from "@/components/logo";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Notifications } from "@/components/notifications";
import { StudentSidebar } from "@/components/student-sidebar";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthAccountStore } from "@/lib/auth-store";
import type { NavItem } from "@/lib/types";
import {
  cn,
  getDefaultRouteByRole,
  isRoleAllowed,
  normalizeRole,
} from "@/lib/utils";
import { useMeQuery } from "@/services/account/hooks";
import {
  Award,
  BookOpen,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const studentNavItems: NavItem[] = [
  { title: "Tổng quan", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Dự án", href: "/student/projects", icon: BookOpen },
  { title: "Quản lý task", href: "/student/tasks", icon: KanbanSquare },
  { title: "Quản lý tiến độ", href: "/student/progress", icon: BookOpen },
  { title: "Điểm số", href: "/student/scores", icon: Award },
  { title: "Publication", href: "/student/publications", icon: FileText },
  { title: "Lời mời", href: "/student/invitations", icon: Mail },
  { title: "Hồ sơ", href: "/student/profile", icon: User },
];

const getPageTitle = (pathname: string) => {
  const item = studentNavItems.find((item) => pathname.startsWith(item.href));
  return item?.title || "Học viên";
};

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

    if (!user || !token) {
      navigate("/login", { replace: true });
      return;
    }

    const roleFromAccount = account?.role;
    const roleFromUser = user?.role ? String(user.role) : null;

    const rawRole = roleFromAccount ?? roleFromUser ?? null;
    const userRole = normalizeRole(rawRole);

    if (rawRole) {
      if (!isRoleAllowed(userRole, location.pathname)) {
        const defaultRoute = getDefaultRouteByRole(rawRole);
        navigate(defaultRoute, { replace: true });
        return;
      }
    } else if (user?.role && location.pathname.startsWith("/student")) {
      const userRoleStr = String(user.role).toLowerCase();
      if (userRoleStr !== "student") {
        const defaultRoute = getDefaultRouteByRole(userRoleStr);
        navigate(defaultRoute, { replace: true });
        return;
      }

      return;
    }
  }, [user, loading, meLoading, navigate, location.pathname, account, token]);

  if (loading || meLoading) {
    return <LoadingScreen message="Đang tải dữ liệu..." />;
  }

  if (!user || !token) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
          <div className="flex items-center justify-between h-14 px-4">
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

        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
          <div className="flex items-center justify-around h-16 px-2">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 hover:bg-accent/50 text-muted-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="text-xs font-medium">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <Logo orientation="horizontal" />
                  </div>
                  <nav className="flex-1 space-y-2 px-2">
                    {studentNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.href ||
                        (item.href !== "/" &&
                          location.pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 w-full py-4 rounded-xl transition-all",
                            isActive
                              ? "bg-primary text-white shadow-md"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center rounded-lg transition-all",
                              isActive ? "bg-white/20 p-2" : "p-2"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-6 w-6",
                                isActive ? "text-white" : ""
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium text-center",
                              isActive ? "text-white" : "text-muted-foreground"
                            )}
                          >
                            {item.title}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="border-t pt-4 px-2">
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center justify-center gap-2 w-full py-4 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      onClick={logout}
                    >
                      <div className="p-2">
                        <LogOut className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-medium">Đăng xuất</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <MobileBottomNav navItems={studentNavItems} />
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <StudentSidebar navItems={studentNavItems} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm px-4 md:px-6">
          <h1 className="flex-1 text-lg font-semibold md:text-xl font-headline">
            {getPageTitle(location.pathname)}
          </h1>
          <div className="flex items-center gap-4">
            <Notifications />
            <UserNav />
          </div>
        </header>

        <main className="flex-1 overflow-auto py-4 pb-20">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
