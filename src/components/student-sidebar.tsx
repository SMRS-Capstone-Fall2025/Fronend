import Logo from "@/components/logo";
import { type NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface StudentSidebarProps {
  navItems: NavItem[];
}

export function StudentSidebar({ navItems }: StudentSidebarProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-24 flex-col items-center bg-white border-r border-border py-4">
      <div className="mb-6">
        <Logo showText={true} orientation="vertical" />
      </div>

      <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/" && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-xl transition-all relative group p-2",
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
              title={item.title}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg transition-all",
                  isActive ? "bg-white/20 p-2" : "p-2"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "")} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight px-0.5",
                  isActive ? "text-white" : "text-muted-foreground"
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
