import { z } from "zod";

export const verifyTokenSchema = z.object({
   body: z.object({}).optional(),
   query: z.object({}).optional(),
   params: z.object({}).optional(),
});

export const adminLoginSchema = z.object({
   body: z.object({
      email: z.string().email("Invalid email format").min(1, "Email is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
   }),
});

export const userRegisterSchema = z.object({
   body: z.object({
      firstName: z.string().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
      lastName: z.string().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
      email: z.string().email("Invalid email format").min(1, "Email is required"),
      password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
   }),
});

export const userLoginSchema = z.object({
   body: z.object({
      email: z.string().email("Invalid email format").min(1, "Email is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
   }),
});

export type VerifyTokenDto = z.infer<typeof verifyTokenSchema>;
export type AdminLoginDto = z.infer<typeof adminLoginSchema>;
export type UserRegisterDto = z.infer<typeof userRegisterSchema>;
export type UserLoginDto = z.infer<typeof userLoginSchema>;
