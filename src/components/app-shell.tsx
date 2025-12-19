import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Logo from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { type NavItem } from "@/lib/types";
import { Link, useLocation } from "react-router-dom";
import { Notifications } from "./notifications";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface AppShellProps {
  navItems: NavItem[];
  children: React.ReactNode;
  pageTitle: string;
}

export function AppShell({ navItems, children, pageTitle }: AppShellProps) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          {(() => {

            const grouped = navItems.reduce((acc, item, index) => {
              const group = item.group || "default";
              if (!acc[group]) {
                acc[group] = [];
              }
              acc[group].push({ ...item, originalIndex: index });
              return acc;
            }, {} as Record<string, Array<NavItem & { originalIndex: number }>>);

            const groups = Object.keys(grouped);
            return groups.map((groupName) => {
              const items = grouped[groupName];
              return (
                <SidebarGroup key={groupName}>
                  <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => (
                        <SidebarMenuItem key={item.originalIndex}>
                          <SidebarMenuButton
                            asChild
                            isActive={
                              location.pathname === item.href ||
                              (item.href !== "/" &&
                                location.pathname.startsWith(item.href))
                            }
                            disabled={item.disabled}
                          >
                            <Link to={item.href}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            });
          })()}
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2.5 h-10 hover:bg-accent/50 hover:text-accent-foreground transition-all"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="flex-1 text-lg font-semibold md:text-xl font-headline">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-4">
            <Notifications />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
