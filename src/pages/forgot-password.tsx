import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useForgotPasswordMutation } from "@/services";
import { getErrorMessage } from "@/lib/utils";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";

import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useForgotPasswordMutation({
    onSuccess: () => {
      toast({
        title: "Yêu cầu đã được gửi",
        description:
          "Vui lòng kiểm tra email để nhận hướng dẫn thay đổi mật khẩu.",
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Gửi yêu cầu thất bại",
        description: getErrorMessage(error, "Có lỗi xảy ra"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutation.mutate({ email: data.email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Quên mật khẩu</CardTitle>
            <CardDescription>
              Nhập email của bạn để nhận hướng dẫn thay đổi mật khẩu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="email@example.com"
                  {...register("email")}
                  disabled={isSubmitting || mutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || mutation.isPending}
                >
                  Gửi yêu cầu
                </Button>
              </div>

              <div className="pt-2 text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
