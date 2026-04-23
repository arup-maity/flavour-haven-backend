import { z } from "zod";

export const createAdminUserSchema = z.object({
   body: z.object({
      email: z.string().email("Invalid email format").min(1, "Email is required"),
      password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
      firstName: z.string().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
      lastName: z.string().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
   }),
});

export type CreateAdminUserDto = z.infer<typeof createAdminUserSchema>;
