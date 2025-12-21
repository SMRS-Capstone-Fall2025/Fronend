import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ và tên"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\+?\d{9,15}$/.test(value),
      "Số điện thoại không hợp lệ"
    ),
  avatar: z.string().trim().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

export type SecurityFormValues = z.infer<typeof securitySchema>;

export const adminProfileSchema = z.object({
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
      (value) => value === "" || /^https?:\/\/.*$/.test(value),
      "Đường dẫn ảnh phải bắt đầu bằng http hoặc https"
    ),
});

export type AdminProfileFormValues = z.infer<typeof adminProfileSchema>;

export const adminSecuritySchema = z
  .object({
    currentPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

export type AdminSecurityFormValues = z.infer<typeof adminSecuritySchema>;
