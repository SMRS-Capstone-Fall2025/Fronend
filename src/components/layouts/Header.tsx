import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, LayoutDashboard, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <Logo />
      <nav className="hidden md:flex items-center space-x-8">
        <Link
          to="#courses"
          className="text-sm font-medium text-primary/80 hover:text-primary"
        >
          Khóa học
        </Link>
        <Link
          to="#instructors"
          className="text-sm font-medium text-primary/80 hover:text-primary"
        >
          Giảng viên
        </Link>
        <Link
          to="#reviews"
          className="text-sm font-medium text-primary/80 hover:text-primary"
        >
          Đánh giá
        </Link>
        <Link
          to="#contact"
          className="text-sm font-medium text-primary/80 hover:text-primary"
        >
          Liên hệ
        </Link>
      </nav>

      {/* Conditional rendering based on user login status */}
      {user ? (
        // Logged in - Show user info
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link to={`/${user.role}/dashboard`}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Bảng điều khiển
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/${user.role}/dashboard`}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Bảng điều khiển</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/${user.role}/profile`}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        // Not logged in - Show login/register buttons
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Đăng nhập</Link>
          </Button>
          <Button asChild className="hidden sm:flex">
            <Link to="/register">
              Đăng ký ngay <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}
