"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = void 0;
const zod_1 = require("zod");
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
exports.adminLogin = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, { message: "Email is required." })
        .email("Please enter a valid email address."),
    password: zod_1.z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
    }),
});
