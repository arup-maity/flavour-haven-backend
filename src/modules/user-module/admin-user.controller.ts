import { Router } from "express";
import { adminAuthentication, validate } from "@/middleware";
import * as UserService from "./user.service";
import { createUserSchema, updateUserSchema, getUserIdSchema, userListQuerySchema, customerListQuerySchema } from "./dto/user.dto";

const adminUserRouting = Router();
adminUserRouting.use(adminAuthentication());

adminUserRouting.post("/create-user", validate(createUserSchema), UserService.createUser);
adminUserRouting.put("/update-user/:id", validate(updateUserSchema), UserService.updateUser);
adminUserRouting.get("/read-user/:id", validate(getUserIdSchema), UserService.getUserById);
adminUserRouting.delete("/delete-user/:id", validate(getUserIdSchema), UserService.deleteUser);
adminUserRouting.get("/user-list", validate(userListQuerySchema), UserService.getUserList);
adminUserRouting.get("/customer-list", validate(customerListQuerySchema), UserService.getCustomerList);

export default adminUserRouting;
