import { z } from "zod";

export const createUserSchema = z.object({
   body: z.object({
      email: z.string().email("Invalid email format").min(1, "Email is required"),
      password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
      firstName: z.string().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
      lastName: z.string().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
      role: z.enum(["admin", "user"], { message: "Role is required" }),
   }),
});

export const updateUserSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
   body: z
      .object({
         firstName: z.string().min(1, "First name is required").max(100, "First name must be less than 100 characters").optional(),
         lastName: z.string().min(1, "Last name is required").max(100, "Last name must be less than 100 characters").optional(),
         email: z.string().email("Invalid email format").optional(),
         role: z.enum(["admin", "user"]).optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
         message: "At least one field must be provided for update",
      }),
});

export const getUserIdSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
});

export const userListQuerySchema = z.object({
   query: z.object({
      page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional().default(1),
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(25),
      search: z.string().max(255, "Search term must be less than 255 characters").optional(),
      role: z.enum(["admin", "user", "all"]).optional().default("all"),
      column: z.string().optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
   }),
});

export const customerListQuerySchema = z.object({
   query: z.object({
      page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional().default(1),
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(25),
      search: z.string().max(255, "Search term must be less than 255 characters").optional(),
      column: z.string().optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
   }),
});

export const addAddressSchema = z.object({
   body: z.object({
      addressLine1: z.string().min(1, "Address line 1 is required").max(255, "Address line 1 must be less than 255 characters"),
      addressLine2: z.string().max(255, "Address line 2 must be less than 255 characters").optional(),
      city: z.string().min(1, "City is required").max(100, "City must be less than 100 characters"),
      state: z.string().min(1, "State is required").max(100, "State must be less than 100 characters"),
      postalCode: z.string().min(1, "Postal code is required").max(20, "Postal code must be less than 20 characters"),
      country: z.string().min(1, "Country is required").max(100, "Country must be less than 100 characters"),
      isDefault: z.boolean().optional().default(false),
   }),
});

export const updateAddressSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
   body: z
      .object({
         addressLine1: z.string().min(1, "Address line 1 is required").max(255, "Address line 1 must be less than 255 characters").optional(),
         addressLine2: z.string().max(255, "Address line 2 must be less than 255 characters").optional(),
         city: z.string().min(1, "City is required").max(100, "City must be less than 100 characters").optional(),
         state: z.string().min(1, "State is required").max(100, "State must be less than 100 characters").optional(),
         postalCode: z.string().min(1, "Postal code is required").max(20, "Postal code must be less than 20 characters").optional(),
         country: z.string().min(1, "Country is required").max(100, "Country must be less than 100 characters").optional(),
         isDefault: z.boolean().optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
         message: "At least one field must be provided for update",
      }),
});

export const getAddressIdSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
});

export const orderListQuerySchema = z.object({
   query: z.object({
      page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional().default(1),
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(15),
      search: z.string().max(255, "Search term must be less than 255 characters").optional(),
      column: z.string().optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
   }),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type GetUserIdDto = z.infer<typeof getUserIdSchema>;
export type UserListQueryDto = z.infer<typeof userListQuerySchema>;
export type CustomerListQueryDto = z.infer<typeof customerListQuerySchema>;
export type AddAddressDto = z.infer<typeof addAddressSchema>;
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
export type GetAddressIdDto = z.infer<typeof getAddressIdSchema>;
export type OrderListQueryDto = z.infer<typeof orderListQuerySchema>;
