import { z } from "zod";

export const createTaxonomySchema = z.object({
   body: z.object({
      name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
      slug: z
         .string()
         .min(1, "Slug is required")
         .max(255, "Slug must be less than 255 characters")
         .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
      description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
      thumbnail: z.string().min(1, "Thumbnail is required").optional(),
      type: z.string().min(1, "Type is required"),
   }),
});

export const updateTaxonomySchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
   body: z
      .object({
         name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters").optional(),
         slug: z
            .string()
            .min(1, "Slug is required")
            .max(255, "Slug must be less than 255 characters")
            .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
            .optional(),
         description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
         thumbnail: z.string().min(1, "Thumbnail is required").optional(),
         type: z.string().min(1, "Type is required").optional(),
         oldThumbnail: z.string().optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
         message: "At least one field must be provided for update",
      }),
});

export const getTaxonomyIdSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
});

export const taxonomyListQuerySchema = z.object({
   query: z.object({
      page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional().default(1),
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(15),
      search: z.string().max(255, "Search term must be less than 255 characters").optional(),
      column: z.string().optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
   }),
});

export const tabMenuSchema = z.object({
   query: z.object({}).optional(),
});

export const categoryWithDishesSchema = z.object({
   params: z.object({
      slug: z.string().min(1, "Slug is required"),
   }),
   query: z.object({
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(10),
   }),
});

export const uploadThumbnailSchema = z.object({
   body: z.object({}).optional(),
   query: z.object({}).optional(),
   params: z.object({}).optional(),
   file: z
      .any()
      .refine(
         (file) => {
            if (!file) return false;
            const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            return allowedMimes.includes(file.mimetype);
         },
         {
            message: "File must be a valid image (JPEG, PNG, or WebP)",
         },
      )
      .refine(
         (file) => {
            const maxSize = 5 * 1024 * 1024;
            return file.size < maxSize;
         },
         {
            message: "File size must be less than 5MB",
         },
      )
      .optional(),
});

export type CreateTaxonomyDto = z.infer<typeof createTaxonomySchema>;
export type UpdateTaxonomyDto = z.infer<typeof updateTaxonomySchema>;
export type GetTaxonomyIdDto = z.infer<typeof getTaxonomyIdSchema>;
export type TaxonomyListQueryDto = z.infer<typeof taxonomyListQuerySchema>;
export type TabMenuDto = z.infer<typeof tabMenuSchema>;
export type CategoryWithDishesDto = z.infer<typeof categoryWithDishesSchema>;
export type UploadThumbnailDto = z.infer<typeof uploadThumbnailSchema>;
