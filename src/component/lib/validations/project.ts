import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Tên dự án là bắt buộc"),
  specialization: z.string().trim().min(1, "Chuyên ngành là bắt buộc"),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const inviteSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;
