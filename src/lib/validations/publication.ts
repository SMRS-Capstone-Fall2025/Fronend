import { z } from "zod";

export const publicationTypeSchema = z.enum(["Journal", "Conference"]);

export const publicationStatusSchema = z.enum([
  "Registered",
  "Published",
  "Cancelled",
]);

export const createPublicationSchema = z.object({
  projectId: z.number().min(1, "Vui lòng chọn dự án"),
  publicationName: z
    .string()
    .min(1, "Tên publication không được để trống")
    .max(500, "Tên publication không được vượt quá 500 ký tự"),
  publicationType: publicationTypeSchema,
  publicationLink: z
    .string()
    .url("Link không hợp lệ")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Ghi chú không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
  doi: z
    .string()
    .max(200, "DOI không được vượt quá 200 ký tự")
    .optional()
    .or(z.literal("")),
  isbnIssn: z
    .string()
    .max(200, "ISBN/ISSN không được vượt quá 200 ký tự")
    .optional()
    .or(z.literal("")),
});

export const updatePublicationSchema = z.object({
  publicationName: z
    .string()
    .min(1, "Tên publication không được để trống")
    .max(500, "Tên publication không được vượt quá 500 ký tự")
    .optional(),
  publicationType: publicationTypeSchema.optional(),
  publicationLink: z
    .string()
    .url("Link không hợp lệ")
    .optional()
    .or(z.literal("")),
  status: publicationStatusSchema.optional(),
  notes: z
    .string()
    .max(1000, "Ghi chú không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
  doi: z
    .string()
    .max(200, "DOI không được vượt quá 200 ký tự")
    .optional()
    .or(z.literal("")),
  isbnIssn: z
    .string()
    .max(200, "ISBN/ISSN không được vượt quá 200 ký tự")
    .optional()
    .or(z.literal("")),
});

export type CreatePublicationFormData = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationFormData = z.infer<typeof updatePublicationSchema>;
