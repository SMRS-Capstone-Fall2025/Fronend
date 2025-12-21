import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
  role: z.enum(["student", "instructor", "staff", "admin", "mentor", "dean"], {
    required_error: "Vui lòng chọn vai trò",
  }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
