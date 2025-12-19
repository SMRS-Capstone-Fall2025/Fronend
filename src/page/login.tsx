import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useAuthAccountStore } from "@/lib/auth-store";
import { getDefaultRouteByRole, getErrorMessage } from "@/lib/utils";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useLoginMutation } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Fade, Slide } from "react-awesome-reveal";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  const { toast } = useToast();
  const { loginWithToken, user, loading } = useAuth();
  const account = useAuthAccountStore((s) => s.account);
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLoginMutation({
    onSuccess: (response) => {
      const token = response.data?.token;

      if (!token) {
        throw new Error("Invalid response from server");
      }

      loginWithToken(token, {
        email: response.data?.email,
        role: response.data?.role,
      });

      toast({
        title: "Đăng nhập thành công!",
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Đăng nhập thất bại",
        description: getErrorMessage(error, "Email hoặc mật khẩu không đúng"),
        variant: "destructive",
      });
    },
  });

  const isLoading = loginMutation.isPending || isSubmitting;

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const currentPath = location.pathname;
  const isOnRoleRoute =
    currentPath.startsWith("/admin") ||
    currentPath.startsWith("/dean") ||
    currentPath.startsWith("/mentor") ||
    currentPath.startsWith("/student") ||
    currentPath.startsWith("/staff") ||
    currentPath.startsWith("/instructor");

  if (isOnRoleRoute) {
    return null;
  }

  const roleFromAccount = account?.role;
  const roleFromUser = user?.role;

  const rawRole = roleFromAccount ?? roleFromUser ?? null;

  if (!loading && user && !isLoading && !isOnRoleRoute) {
    const redirectPath = getDefaultRouteByRole(rawRole);
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="max-w-md space-y-6">
            <Slide triggerOnce direction="down" duration={500}>
              <div className="flex justify-center">
                <Logo className="scale-150" variant="light" />
              </div>
            </Slide>

            <Fade triggerOnce delay={220}>
              <p className="text-xl text-center text-white/90">
                Nền tảng quản lý nghiên cứu và dự án học thuật toàn diện
              </p>
            </Fade>
            <div className="space-y-4 pt-8">
              {[
                {
                  title: "Theo dõi tiến độ tức thời",
                  description:
                    "Nắm rõ trạng thái từng nhiệm vụ và mốc thời gian quan trọng.",
                  iconPath: "M5 13l4 4L19 7",
                },
                {
                  title: "Quy trình cộng tác rõ ràng",
                  description:
                    "Kết nối sinh viên, giảng viên và cố vấn trong cùng một không gian.",
                  iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                {
                  title: "Hồ sơ minh chứng tập trung",
                  description:
                    "Quản lý tài liệu, phản hồi và lịch sử duyệt dễ dàng.",
                  iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                },
              ].map((item, index) => (
                <Slide
                  key={item.title}
                  triggerOnce
                  direction="up"
                  delay={300 + index * 120}
                >
                  <div className="flex items-center gap-3 text-white/90">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={item.iconPath}
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-white/70">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Slide>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Slide triggerOnce direction="up">
          <div className="w-full max-w-md space-y-8">
            <Fade triggerOnce>
              <div className="text-center lg:hidden mb-8">
                <Logo className="justify-center mb-4" />
              </div>
            </Fade>

            <Fade triggerOnce delay={120}>
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Đăng nhập</h2>
                <p className="text-muted-foreground">
                  Nhập thông tin để truy cập vào tài khoản của bạn
                </p>
              </div>
            </Fade>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="email@fpt.edu.vn"
                  {...register("email")}
                  disabled={isLoading}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                    className={
                      errors.password ? "border-destructive pr-10" : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-11"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <Fade triggerOnce delay={360}>
              <div className="pt-4 text-center text-xs text-muted-foreground">
                <p>
                  Bằng cách đăng nhập, bạn đồng ý với{" "}
                  <Link to="/terms" className="underline hover:text-primary">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="underline hover:text-primary">
                    Chính sách bảo mật
                  </Link>{" "}
                  của chúng tôi.
                </p>
              </div>
            </Fade>
          </div>
        </Slide>
      </div>
    </div>
  );
}
