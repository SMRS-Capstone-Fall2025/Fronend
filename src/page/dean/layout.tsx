import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Users2,
} from "lucide-react";
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

const deanNavItems: NavItem[] = [
  { title: "Tổng quan", href: "/dean/dashboard", icon: LayoutDashboard },
  { title: "Hội đồng", href: "/dean/councils", icon: Users2 },
  { title: "Dự án", href: "/dean/projects", icon: FolderKanban },
];

const getPageTitle = (pathname: string) => {
  const item = deanNavItems.find((entry) => pathname.startsWith(entry.href));
  return item?.title ?? "Trưởng khoa";
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

  useEffect(() => {
    if (loading) return;

    // const token = localStorage.getItem("token");
    // if (!token || !user) {
    //   navigate("/login", { replace: true });
    //   return;
    // }

    // if (user.role !== "dean") {
    //   navigate(`/${user.role}/dashboard`, { replace: true });
    // }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[240px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
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

        <main className="flex-1 p-4 pb-20">{children}</main>

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
