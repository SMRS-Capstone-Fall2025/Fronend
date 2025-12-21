import { z } from "zod";

export const councilFormSchema = z.object({
  councilCode: z
    .string()
    .min(1, "Mã hội đồng không được để trống")
    .max(50, "Mã hội đồng tối đa 50 ký tự"),
  councilName: z
    .string()
    .min(1, "Tên hội đồng không được để trống")
    .max(120, "Tên hội đồng tối đa 120 ký tự"),
  department: z
    .string()
    .min(1, "Khoa / Bộ môn là bắt buộc")
    .max(120, "Tên khoa tối đa 120 ký tự"),
  description: z
    .string()
    .min(1, "Mô tả là bắt buộc")
    .max(500, "Mô tả tối đa 500 ký tự"),
  lecturerEmails: z
    .array(z.string().email("Email không hợp lệ"))
    .min(1, "Vui lòng chọn ít nhất một giảng viên")
    .max(5, "Tối đa 5 giảng viên cho một hội đồng"),
});

export type CouncilFormValues = z.infer<typeof councilFormSchema>;
