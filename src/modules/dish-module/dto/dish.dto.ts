import { z } from "zod";

export const createDishSchema = z.object({
   body: z.object({
      title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
      slug: z
         .string()
         .min(1, "Slug is required")
         .max(255, "Slug must be less than 255 characters")
         .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
      description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
      shortDescription: z.string().min(1, "Short description is required").max(500, "Short description must be less than 500 characters"),
      price: z.number().min(0, "Price must be positive").int("Price must be an integer"),
      costPrice: z.number().min(0, "Cost price must be positive").int("Cost price must be an integer").optional(),
      thumbnail: z.string().min(1, "Thumbnail path is required").optional(),
      nonVeg: z.boolean().optional().default(false),
      category: z.array(z.number().int().positive("Category ID must be positive")).min(1, "At least one category is required"),
   }),
});

export const updateDishSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
   body: z
      .object({
         title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
         slug: z
            .string()
            .min(1, "Slug is required")
            .max(255, "Slug must be less than 255 characters")
            .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
            .optional(),
         description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
         shortDescription: z
            .string()
            .min(1, "Short description is required")
            .max(500, "Short description must be less than 500 characters")
            .optional(),
         price: z.number().min(0, "Price must be positive").int("Price must be an integer").optional(),
         costPrice: z.number().min(0, "Cost price must be positive").int("Cost price must be an integer").optional(),
         thumbnail: z.string().min(1, "Thumbnail path is required").optional(),
         nonVeg: z.boolean().optional(),
         category: z.array(z.number().int().positive("Category ID must be positive")).min(1, "At least one category is required").optional(),
         oldThumbnail: z.string().optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
         message: "At least one field must be provided for update",
      }),
});

export const getDishByIdSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
});

export const deleteDishSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
   query: z.object({
      thumbnail: z.string().optional(),
   }),
});

export const getAllDishesSchema = z.object({
   query: z.object({
      page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional().default(1),
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(15),
      search: z.string().max(255, "Search term must be less than 255 characters").optional(),
      column: z.string().optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
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

export type CreateDishDto = z.infer<typeof createDishSchema>;
export type UpdateDishDto = z.infer<typeof updateDishSchema>;
export type GetDishByIdDto = z.infer<typeof getDishByIdSchema>;
export type DeleteDishDto = z.infer<typeof deleteDishSchema>;
export type GetAllDishesDto = z.infer<typeof getAllDishesSchema>;
export type UploadThumbnailDto = z.infer<typeof uploadThumbnailSchema>;
