import { Router } from "express";
import { validate } from "@/middleware";
import * as AuthService from "./auth.service";
import { verifyTokenSchema, adminLoginSchema, userRegisterSchema, userLoginSchema } from "./dto/auth.dto";

const authRouting = Router();

authRouting.get("/verify-token", validate(verifyTokenSchema), AuthService.verifyToken);
authRouting.post("/admin-login", validate(adminLoginSchema), AuthService.adminLogin);
authRouting.post("/user-register", validate(userRegisterSchema), AuthService.userRegister);
authRouting.post("/user-login", validate(userLoginSchema), AuthService.userLogin);

export default authRouting;
