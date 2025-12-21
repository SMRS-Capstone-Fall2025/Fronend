import { z } from "zod";

export const taskSchema = z.object({
  name: z.string().min(1, "Tên công việc bắt buộc"),
  description: z.string().optional().nullable(),
  assignedToId: z.number().optional().nullable(),
  milestoneId: z.number().optional().nullable(),
  deadline: z
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
        message: "Hạn hoàn thành không được là ngày trong quá khứ",
      }
    ),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
