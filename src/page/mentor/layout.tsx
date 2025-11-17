import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Flag, KanbanSquare, Mail, Menu, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { NavItem } from "@/lib/types";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { UserNav } from "@/components/user-nav";
import { Notifications } from "@/components/notifications";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/logo";

const mentorNavItems: NavItem[] = [
  { title: "Quản lý dự án", href: "/mentor/projects", icon: BookOpen },
  { title: "Quản lý task", href: "/mentor/tasks", icon: KanbanSquare },
  { title: "Quản lý tiến độ", href: "/mentor/progress", icon: Flag },
  { title: "Lời mời", href: "/mentor/invitations", icon: Mail },
  // { title: "Lịch dạy", href: "/mentor/schedule", icon: Calendar },
  // {
  //   title: "Học viên",
  //   href: "/mentor/students",
  //   icon: Shield,
  //   disabled: true,
  // },
  // {
  //   title: "Tài liệu",
  //   href: "/mentor/resources",
  //   icon: BookOpen,
  //   disabled: true,
  // },
  // {
  //   title: "Lịch sử thanh toán",
  //   href: "/mentor/payments",
  //   icon: CreditCard,
  //   disabled: true,
  // },
  { title: "Hồ sơ", href: "/mentor/profile", icon: User },
  // {
  //   title: "Báo cáo",
  //   href: "/mentor/reports",
  //   icon: BarChart,
  //   disabled: true,
  // },
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

  useEffect(() => {
    if (!loading) {
      // if (!user || !token) {
      //   navigate("/login", { replace: true });
      // }
      // NOTE: role-based redirect disabled per request —
      // if (user && user.role !== "mentor") {
      //   navigate(`/${user.role}/dashboard`, { replace: true });
      // }
    }
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

  const token = localStorage.getItem("token");
  if (!user || !token /* || user.role !== "mentor" */) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
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

        <main className="flex-1 p-4 pb-20">{children}</main>

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
