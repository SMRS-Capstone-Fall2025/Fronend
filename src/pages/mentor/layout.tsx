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
  BookOpen,
  Building2,
  FileText,
  Flag,
  GraduationCap,
  KanbanSquare,
  Mail,
  Menu,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const mentorNavItems: NavItem[] = [
  {
    title: "Quản lý dự án",
    href: "/mentor/projects",
    icon: BookOpen,
    group: "Dự án",
  },
  {
    title: "Nhóm đang mentor",
    href: "/mentor/mentoring",
    icon: GraduationCap,
    group: "Dự án",
  },
  {
    title: "Quản lý task",
    href: "/mentor/tasks",
    icon: KanbanSquare,
    group: "Công việc",
  },
  {
    title: "Quản lý tiến độ",
    href: "/mentor/progress",
    icon: Flag,
    group: "Công việc",
  },
  {
    title: "Chấm điểm",
    href: "/mentor/reports",
    icon: FileText,
    group: "Công việc",
  },
  {
    title: "Hội đồng",
    href: "/mentor/councils",
    icon: Building2,
    group: "Khác",
  },
  { title: "Lời mời", href: "/mentor/invitations", icon: Mail, group: "Khác" },
  { title: "Hồ sơ", href: "/mentor/profile", icon: User, group: "Khác" },
];

const getPageTitle = (pathname: string) => {
  const item = mentorNavItems.find((item) => pathname.startsWith(item.href));
  return item?.title || "Mentor";
};

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
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

    const roleFromAccount = account?.role;
    const rawRole = roleFromAccount;

    if (rawRole) {
      if (!isRoleAllowed(rawRole, location.pathname)) {
        const defaultRoute = getDefaultRouteByRole(rawRole);
        navigate(defaultRoute, { replace: true });
        return;
      }
    } else if (user?.role && location.pathname.startsWith("/mentor")) {
      const userRoleStr = String(user.role).toLowerCase();
      if (userRoleStr !== "mentor" && userRoleStr !== "lecturer") {
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
                    <Logo />
                  </div>
                  <nav className="flex-1 space-y-1">
                    {mentorNavItems.map((item) => {
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

            <MobileBottomNav navItems={mentorNavItems} />
          </div>
        </nav>
      </div>
    );
  }

  return (
    <AppShell
      navItems={mentorNavItems}
      pageTitle={getPageTitle(location.pathname)}
    >
      {children}
    </AppShell>
  );
}
