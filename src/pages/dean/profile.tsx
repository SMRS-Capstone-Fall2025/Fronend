import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/upload/image-upload";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import {
  useChangePasswordMutation,
  useUpdateAccountMutation,
} from "@/services/account";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  UserCircle,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  profileSchema,
  securitySchema,
  type ProfileFormValues,
  type SecurityFormValues,
} from "@/lib/validations/profile";
import DeanLayout from "./layout";

function DeanProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const storedProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem("deanProfile");
      return raw ? (JSON.parse(raw) as ProfileFormValues) : null;
    } catch {
      return null;
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: storedProfile?.fullName ?? user?.name ?? "",
      email: storedProfile?.email ?? user?.email ?? "",
      phone: storedProfile?.phone ?? "",
      avatar: storedProfile?.avatar ?? user?.avatar ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset((current) => ({
        ...current,
        fullName: user.name,
        email: user.email,
        avatar: user.avatar || current.avatar || "",
      }));
    }
  }, [user, reset]);

  const updateAccountMutation = useUpdateAccountMutation({
    onSuccess: (data) => {
      const updatedAvatar = data.data?.avatar ?? null;
      if (updatedAvatar !== undefined) {
        setValue("avatar", updatedAvatar || "", { shouldDirty: false });
      }
      toast({
        title: "Cập nhật hồ sơ thành công",
        description: "Thông tin cá nhân của bạn đã được lưu.",
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Cập nhật hồ sơ thất bại",
        description: getErrorMessage(
          error,
          "Đã có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại."
        ),
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = async (values: ProfileFormValues) => {
    await updateAccountMutation.mutateAsync({
      name: values.fullName,
      phone: values.phone || null,
      avatar: values.avatar || null,
    });
  };

  const isSavingProfile = isSubmitting || updateAccountMutation.isPending;

  const {
    register: registerSecurity,
    handleSubmit: handleSecuritySubmit,
    formState: { errors: securityErrors, isSubmitting: isSecuritySubmitting },
    reset: resetSecurity,
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useChangePasswordMutation({
    onSuccess: () => {
      resetSecurity();
      setPwdOpen(false);
      toast({
        title: "Đổi mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật.",
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: getErrorMessage(
          error,
          "Đã có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại."
        ),
        variant: "destructive",
      });
    },
  });

  const onSubmitSecurity = async (values: SecurityFormValues) => {
    await changePasswordMutation.mutateAsync({
      oldPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  const [pwdOpen, setPwdOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6 pb-16">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <UserCircle className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Thông tin cá nhân
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý và cập nhật thông tin tài khoản của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Ảnh đại diện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ImageUpload
                  value={watch("avatar")}
                  onChange={(url) =>
                    setValue("avatar", url || "", { shouldDirty: true })
                  }
                  onUploadSuccess={async (url) => {
                    await updateAccountMutation.mutateAsync({
                      name: watch("fullName"),
                      phone: watch("phone") || null,
                      avatar: url || null,
                    });
                  }}
                  disabled={isSavingProfile}
                />
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm font-medium">
                    {user?.name || "Trưởng bộ môn"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Thông tin cơ bản
                </CardTitle>
                <CardDescription>
                  Thông tin cá nhân và liên hệ của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      Họ và tên
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      {...register("fullName")}
                      disabled={isSavingProfile}
                      className="h-11"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      {...register("email")}
                      disabled
                      className="h-11 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email được dùng để đăng nhập và không thể thay đổi.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    placeholder="0912345678"
                    {...register("phone")}
                    disabled={isSavingProfile}
                    className="h-11"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPwdOpen(true)}
                className="w-full sm:w-auto"
              >
                <Lock className="mr-2 h-4 w-4" />
                Đổi mật khẩu
              </Button>
              <Button
                type="submit"
                disabled={isSavingProfile || !isDirty}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog
        open={pwdOpen}
        onOpenChange={(open) => {
          setPwdOpen(open);
          if (!open) {
            resetSecurity();
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Đảm bảo mật khẩu mạnh để bảo vệ tài khoản của bạn.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSecuritySubmit(onSubmitSecurity)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu hiện tại"
                  {...registerSecurity("currentPassword")}
                  disabled={
                    isSecuritySubmitting || changePasswordMutation.isPending
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={
                    isSecuritySubmitting || changePasswordMutation.isPending
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {securityErrors.currentPassword && (
                <p className="text-sm text-destructive">
                  {securityErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  {...registerSecurity("newPassword")}
                  disabled={
                    isSecuritySubmitting || changePasswordMutation.isPending
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={
                    isSecuritySubmitting || changePasswordMutation.isPending
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {securityErrors.newPassword && (
                <p className="text-sm text-destructive">
                  {securityErrors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  {...registerSecurity("confirmPassword")}
                  disabled={
                    isSecuritySubmitting || changePasswordMutation.isPending
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={
                    isSecuritySubmitting || changePasswordMutation.isPending
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {securityErrors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {securityErrors.confirmPassword.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <div className="w-full flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetSecurity();
                    setPwdOpen(false);
                  }}
                  disabled={
                    isSecuritySubmitting || changePasswordMutation.isPending
                  }
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSecuritySubmitting || changePasswordMutation.isPending
                  }
                >
                  {isSecuritySubmitting || changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DeanProfile() {
  return (
    <DeanLayout>
      <DeanProfilePage />
    </DeanLayout>
  );
}
