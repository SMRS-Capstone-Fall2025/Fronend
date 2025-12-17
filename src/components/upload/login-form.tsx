import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { type Role } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { useLoginMutation } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { loginFormSchema, type LoginFormValues } from "@/lib/validations/login";

import Logo from "./logo";

export default function LoginForm() {
  const { loginWithToken } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "student@example.com",
      password: "password",
      role: "student",
    },
  });

  const loginMutation = useLoginMutation();

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (res) => {
          const token = res.data?.token;
          if (token) {
            loginWithToken(token, {
              email: res.data?.email ?? data.email,
              role: res.data?.role ?? data.role,
            });
            toast({
              title: "Đăng nhập thành công",
              description: res?.message ?? undefined,
            });
          } else {
            loginWithToken("demo-token", {
              email: data.email,
              role: data.role,
            });
            toast({
              title: "Đăng nhập (demo)",
              description: "Không nhận được token từ API, sử dụng chế độ demo.",
            });
          }
        },
        onError: (err: unknown) => {
          toast({
            title: "Đăng nhập thất bại",
            description: getErrorMessage(err, "Đã có lỗi xảy ra"),
            variant: "destructive",
          });
        },
      }
    );
  });

  const roleNames: Record<Role, string> = {
    student: "Học viên",
    instructor: "Giảng viên",
    staff: "Nhân viên",
    admin: "Quản trị viên",
    mentor: "Người hướng dẫn",
    dean: "Trưởng bộ môn",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-4" />
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Chọn vai trò để tiếp tục (đây là bản demo).
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                disabled={isSubmitting || loginMutation.isPending}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                disabled={isSubmitting || loginMutation.isPending}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    onValueChange={(value: Role) => field.onChange(value)}
                    value={field.value}
                    disabled={isSubmitting || loginMutation.isPending}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(roleNames) as Role[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {roleNames[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loginMutation.isPending}
            >
              {isSubmitting || loginMutation.isPending
                ? "Đang đăng nhập..."
                : "Đăng nhập"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
