import { useAuthAccountStore } from "@/lib/auth-store";
import { cn, getDefaultRouteByRole, normalizeRole } from "@/lib/utils";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

type LogoVariant = "primary" | "light";
type LogoOrientation = "horizontal" | "vertical";

type LogoProps = Readonly<{
  className?: string;
  variant?: LogoVariant;
  showText?: boolean;
  orientation?: LogoOrientation;
}>;

const variantClassMap: Record<LogoVariant, string> = {
  primary: "text-primary",
  light: "text-white",
};

export default function Logo({
  className,
  variant = "primary",
  showText = true,
  orientation = "horizontal",
}: LogoProps) {
  const colorClass = variantClassMap[variant];
  const isLight = variant === "light";
  const isVertical = orientation === "vertical";

  const account = useAuthAccountStore((s) => s.account);

  const roleFromAccount = account?.role ?? null;

  const normalizedRole = normalizeRole(roleFromAccount) ?? roleFromAccount;
  const to = getDefaultRouteByRole(normalizedRole);

  if (isVertical) {
    return (
      <Link
        to={to}
        className={cn("flex flex-col items-center gap-2", className)}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-xl shadow-sm transition-all hover:shadow-md",
            isLight
              ? "bg-white/10 backdrop-blur-sm border border-white/20"
              : "bg-primary border border-primary/20"
          )}
          style={{
            width: "40px",
            height: "40px",
          }}
        >
          <GraduationCap className={cn("h-5 w-5", "text-white")} />
        </div>
        {showText && (
          <span
            className={cn(
              "font-bold text-xs font-headline tracking-tight",
              colorClass
            )}
          >
            SMRS
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link to={to} className={cn("flex items-center space-x-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg shadow-sm transition-all hover:shadow-md",
          isLight
            ? "bg-white/10 backdrop-blur-sm border border-white/20"
            : "bg-primary border border-primary/20"
        )}
        style={{
          width: "36px",
          height: "36px",
        }}
      >
        <GraduationCap className={cn("h-5 w-5", "text-white")} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold text-lg font-headline tracking-tight",
            colorClass
          )}
        >
          SMRS
        </span>
      )}
    </Link>
  );
}
