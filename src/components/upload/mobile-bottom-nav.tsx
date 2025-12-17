import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/types';

interface MobileBottomNavProps {
  navItems: NavItem[];
}

export function MobileBottomNav({ navItems }: MobileBottomNavProps) {
  const location = useLocation();

  const activeItems = navItems.filter(item => !item.disabled).slice(0, 3);

  return (
    <>
      {activeItems.map((item) => {
        const isActive =
          location.pathname === item.href ||
          (item.href !== "/" && location.pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1",
              "hover:bg-accent/50",
              isActive
                ? "text-primary bg-accent"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.title}</span>
          </Link>
        );
      })}
    </>
  );
}

