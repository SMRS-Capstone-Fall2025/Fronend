import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "./layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Workflow } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ và tên"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\+?\d{9,15}$/.test(value),
      "Số điện thoại không hợp lệ"
    ),
  department: z.string().trim().max(120, "Phòng ban tối đa 120 ký tự"),
  notes: z.string().trim().max(200, "Ghi chú tối đa 200 ký tự"),
  avatar: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https?:\/\//.test(value),
      "Đường dẫn ảnh phải bắt đầu bằng http hoặc https"
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const securitySchema = z
  .object({
    currentPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

type SecurityFormValues = z.infer<typeof securitySchema>;

type PreferenceState = {
  systemAlerts: boolean;
  weeklyDigest: boolean;
  emailReports: boolean;
};

type ActivityItem = {
  id: number;
  title: string;
  description: string;
  timestamp: string;
};

function getAvatarFallback(name: string | undefined) {
  if (!name) {
    return "AD";
  }
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");
  return initials.toUpperCase() || "AD";
}

const activityLogs: ActivityItem[] = [
  {
    id: 1,
    title: "Phê duyệt tài khoản",
    description: "Đã phê duyệt tài khoản giảng viên Nguyễn Văn Hùng",
    timestamp: "Hôm qua, 15:45",
  },
  {
    id: 2,
    title: "Xuất báo cáo",
    description: "Tải xuống báo cáo tài chính tháng 09/2025",
    timestamp: "2 ngày trước, 09:12",
  },
  {
    id: 3,
    title: "Cập nhật lộ trình",
    description: "Điều chỉnh khóa học B2 nâng cao",
    timestamp: "3 ngày trước, 17:20",
  },
];

const defaultPreferences: PreferenceState = {
  systemAlerts: true,
  weeklyDigest: false,
  emailReports: true,
};

function AdminAccountPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<PreferenceState>(() => {
    try {
      const raw = localStorage.getItem("adminAccountPreferences");
      return raw ? (JSON.parse(raw) as PreferenceState) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const storedProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem("adminAccountProfile");
      return raw ? (JSON.parse(raw) as ProfileFormValues) : null;
    } catch {
      return null;
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: storedProfile?.fullName ?? user?.name ?? "",
      email: storedProfile?.email ?? user?.email ?? "",
      phone: storedProfile?.phone ?? "",
      department: storedProfile?.department ?? "Phòng đào tạo",
      notes: storedProfile?.notes ?? "",
      avatar: storedProfile?.avatar ?? user?.avatar ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset((current) => ({
        ...current,
        fullName: user.name,
        email: user.email,
        avatar: current.avatar || user.avatar || "",
      }));
    }
  }, [user, reset]);

  useEffect(() => {
    localStorage.setItem(
      "adminAccountPreferences",
      JSON.stringify(preferences)
    );
  }, [preferences]);

  const handlePreferenceChange = (key: keyof PreferenceState) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmitProfile = async (values: ProfileFormValues) => {
    localStorage.setItem("adminAccountProfile", JSON.stringify(values));
    toast({
      title: "Đã lưu thông tin",
      description: "Hồ sơ quản trị viên đã được cập nhật.",
      variant: "success",
    });
  };

  const avatarUrl = watch("avatar")?.trim() || user?.avatar || "";

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

  const onSubmitSecurity = async (_values: SecurityFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    resetSecurity();
    toast({
      title: "Đổi mật khẩu thành công",
      description: "Mật khẩu quản trị viên đã được cập nhật.",
      variant: "success",
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ quản trị viên</CardTitle>
            <CardDescription>
              Quản lý thông tin tài khoản để đảm bảo liên lạc thông suốt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmitProfile)}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} alt={user?.name} />
                  <AvatarFallback>
                    {getAvatarFallback(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="avatar">Ảnh đại diện</Label>
                  <Input
                    id="avatar"
                    placeholder="https://..."
                    {...register("avatar")}
                    disabled={isSubmitting}
                  />
                  {errors.avatar && (
                    <p className="text-sm text-destructive">
                      {errors.avatar.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Dán đường dẫn ảnh để cập nhật avatar hiển thị.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    {...register("fullName")}
                    disabled={isSubmitting}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    {...register("email")}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email được dùng để đăng nhập và không thể thay đổi.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    placeholder="0912345678"
                    {...register("phone")}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Phòng ban</Label>
                  <Input
                    id="department"
                    placeholder="Phòng đào tạo"
                    {...register("department")}
                    disabled={isSubmitting}
                  />
                  {errors.department && (
                    <p className="text-sm text-destructive">
                      {errors.department.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú nội bộ</Label>
                <Textarea
                  id="notes"
                  placeholder="Thông tin quan trọng cần lưu ý..."
                  {...register("notes")}
                  disabled={isSubmitting}
                  className="min-h-[120px]"
                />
                {errors.notes && (
                  <p className="text-sm text-destructive">
                    {errors.notes.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thiết lập bảo mật</CardTitle>
            <CardDescription>
              Thiết lập mật khẩu mạnh và các tùy chọn bảo mật nâng cao.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSecuritySubmit(onSubmitSecurity)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerSecurity("currentPassword")}
                  disabled={isSecuritySubmitting}
                />
                {securityErrors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {securityErrors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerSecurity("newPassword")}
                  disabled={isSecuritySubmitting}
                />
                {securityErrors.newPassword && (
                  <p className="text-sm text-destructive">
                    {securityErrors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerSecurity("confirmPassword")}
                  disabled={isSecuritySubmitting}
                />
                {securityErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {securityErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSecuritySubmitting}>
                  {isSecuritySubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cấu hình nhận thông báo</CardTitle>
            <CardDescription>
              Tùy chỉnh thông tin mà bạn muốn nhận từ hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Cảnh báo hệ thống</p>
                <p className="text-sm text-muted-foreground">
                  Gửi thông báo khi phát hiện hoạt động bất thường hoặc lỗi hệ
                  thống.
                </p>
              </div>
              <Switch
                checked={preferences.systemAlerts}
                onCheckedChange={() => handlePreferenceChange("systemAlerts")}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Báo cáo qua email</p>
                <p className="text-sm text-muted-foreground">
                  Nhận báo cáo tổng hợp dưới dạng file PDF qua email hàng tuần.
                </p>
              </div>
              <Switch
                checked={preferences.emailReports}
                onCheckedChange={() => handlePreferenceChange("emailReports")}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Bản tin tuần</p>
                <p className="text-sm text-muted-foreground">
                  Cập nhật tiến độ đào tạo, lịch thi và thông tin quan trọng
                  khác.
                </p>
              </div>
              <Switch
                checked={preferences.weeklyDigest}
                onCheckedChange={() => handlePreferenceChange("weeklyDigest")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân quyền & truy cập</CardTitle>
            <CardDescription>
              Kiểm tra nhanh quyền hạn hiện tại của quản trị viên.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div>
                <p className="font-medium">Quyền cao nhất</p>
                <p className="text-sm text-muted-foreground">
                  Có toàn quyền quản trị hệ thống, quản lý người dùng và báo
                  cáo.
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Quản lý người dùng
                </span>
                <Badge variant="outline">Đã cấp</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Quản lý nội dung
                </span>
                <Badge variant="outline">Đã cấp</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Truy cập báo cáo tài chính
                </span>
                <Badge variant="outline">Đã cấp</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Cấu hình hệ thống
                </span>
                <Badge variant="outline">Đang xem xét</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Theo dõi những thao tác gần nhất để bảo mật tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityLogs.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                  <Workflow className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminAccount() {
  return (
    <AdminLayout>
      <AdminAccountPage />
    </AdminLayout>
  );
}
