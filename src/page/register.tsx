import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useCreateAccountMutation } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Fade, Slide } from "react-awesome-reveal";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const highlightItems = [
    {
      title: "📊 Bảng điều phối dự án",
      description:
        "Theo dõi nhiệm vụ, mốc thời gian và mức độ ưu tiên trên cùng một giao diện",
    },
    {
      title: "🧑‍🤝‍🧑 Cộng tác đa vai trò",
      description:
        "Kết nối sinh viên, cố vấn và hội đồng phản biện với quy trình minh bạch",
    },
    {
      title: "�️ Quản lý hồ sơ tập trung",
      description:
        "Lưu trữ tài liệu, biên bản đánh giá và phản hồi ở một nơi duy nhất",
    },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const createAccountMutation = useCreateAccountMutation({
    onSuccess: (response) => {
      toast({
        title: "Đăng ký thành công!",
        description:
          response?.message || "Tài khoản đã được tạo. Bạn có thể đăng nhập.",
        variant: "success",
      });

      navigate("/login");
    },
    onError: (error: unknown) => {
      toast({
        title: "Đăng ký thất bại",
        description: getErrorMessage(
          error,
          "Đã có lỗi xảy ra. Vui lòng thử lại."
        ),
        variant: "destructive",
      });
    },
  });

  const isLoading = createAccountMutation.status === "pending" || isSubmitting;

  const onSubmit = async (data: RegisterFormData) => {
    const { fullName, email, password } = data;

    const payload = {
      name: fullName,
      email,
      password,
      phone: null,
      age: null,
      roleId: { id: 2, roleName: "student" },
    };

    createAccountMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="max-w-md space-y-6">
            <Slide triggerOnce direction="down">
              <div className="flex justify-center">
                <Logo className="scale-150" variant="light" />
              </div>
            </Slide>
            <Slide triggerOnce direction="up" delay={120}>
              <h1 className="text-4xl font-bold text-center">
                Khởi tạo tài khoản SMRS
              </h1>
            </Slide>
            <Fade triggerOnce delay={220}>
              <p className="text-xl text-center text-white/90">
                Tổ chức nghiên cứu khoa học và đồ án tốt nghiệp hiệu quả hơn
              </p>
            </Fade>
            <div className="space-y-4 pt-8">
              {highlightItems.map((item, index) => (
                <Fade key={item.title} triggerOnce delay={300 + index * 120}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-white/80">{item.description}</p>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto">
        <Slide triggerOnce direction="up">
          <div className="w-full max-w-md space-y-4 sm:space-y-6 py-4 sm:py-8">
            <Fade triggerOnce>
              <div className="text-center lg:hidden mb-4">
                <Logo className="justify-center mb-3 scale-90 sm:scale-100" />
              </div>
            </Fade>

            <Fade triggerOnce delay={120}>
              <div className="space-y-1 sm:space-y-2 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Tạo tài khoản
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Điền thông tin để kích hoạt hệ thống quản lý nghiên cứu SMRS
                </p>
              </div>
            </Fade>

            <Fade triggerOnce delay={220}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4"
              >
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="fullName" className="text-sm">
                    Họ và tên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    {...register("fullName")}
                    disabled={isLoading}
                    className={
                      errors.fullName ? "border-destructive h-10" : "h-10"
                    }
                  />
                  {errors.fullName && (
                    <p className="text-xs sm:text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    {...register("email")}
                    disabled={isLoading}
                    className={
                      errors.email ? "border-destructive h-10" : "h-10"
                    }
                  />
                  {errors.email && (
                    <p className="text-xs sm:text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="password" className="text-sm">
                      Mật khẩu <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        disabled={isLoading}
                        className={
                          errors.password
                            ? "border-destructive pr-10 h-10"
                            : "pr-10 h-10"
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 px-3 hover:bg-transparent"
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
                      <p className="text-xs sm:text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">
                      Xác nhận mật khẩu{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        disabled={isLoading}
                        className={
                          errors.confirmPassword
                            ? "border-destructive pr-10 h-10"
                            : "pr-10 h-10"
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs sm:text-sm text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 mt-2"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
              </form>
            </Fade>

            <Fade triggerOnce delay={300}>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Đã có tài khoản? </span>
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Đăng nhập
                </Link>
              </div>
            </Fade>

            <Fade triggerOnce delay={360}>
              <div className="pt-2 sm:pt-4 text-center text-xs text-muted-foreground">
                <p>
                  Bằng cách đăng ký, bạn đồng ý với{" "}
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
