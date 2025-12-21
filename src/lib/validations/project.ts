import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Tên dự án là bắt buộc"),
  specialization: z.string().trim().min(1, "Chuyên ngành là bắt buộc"),
  majorId: z.number().optional(),
  description: z.string().optional().nullable(),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const selectedDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: "Hạn nộp không được là ngày trong quá khứ",
      }
    ),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(1, "Tên dự án là bắt buộc"),
  description: z.string().optional(),
  type: z.string().min(1, "Chuyên ngành là bắt buộc"),
  majorId: z.number().optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const selectedDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: "Hạn nộp không được quá hôm nay",
      }
    ),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const inviteSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;
