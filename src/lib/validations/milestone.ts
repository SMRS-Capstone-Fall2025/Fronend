import { z } from "zod";

export const createMilestoneSchema = z.object({
  description: z
    .string()
    .min(1, "Mô tả là bắt buộc")
    .min(3, "Mô tả phải có ít nhất 3 ký tự")
    .max(500, "Mô tả không được quá 500 ký tự"),
  dueDate: z.string().optional(),
  isFinal: z.boolean().default(false),
});

export type CreateMilestoneFormValues = z.infer<typeof createMilestoneSchema>;

export const updateMilestoneSchema = z.object({
  description: z
    .string()
    .min(1, "Mô tả là bắt buộc")
    .min(3, "Mô tả phải có ít nhất 3 ký tự")
    .max(500, "Mô tả không được quá 500 ký tự"),
  dueDate: z.string().optional(),
  status: z.enum([
    "Pending",
    "InProgress",
    "Completed",
    "Delayed",
    "Cancelled",
  ]),
});

export type UpdateMilestoneFormValues = z.infer<typeof updateMilestoneSchema>;
