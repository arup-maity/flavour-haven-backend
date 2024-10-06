import { z } from "zod";

// export const userSchema = z.object({
//    fullName: z
//       .string()
//       .min(2, "Full name must be at least 2 characters long."),
//    email: z
//       .string()
//       .min(1, { message: "Email is required." })
//       .email("Please enter a valid email address."),
//    password: z
//       .string()
//       .min(8, { message: "Password must be at least 8 characters long." })
//       .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/, {
//          message:
//             "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
//       }),
// });
export const adminLogin = z.object({
   email: z
      .string()
      .min(1, { message: "Email is required." })
      .email("Please enter a valid email address."),
   password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/, {
         message:
            "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      }),
});