import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "@/config/prisma";
import { adminAuthentication } from "@/middleware";
import type { UserListQuery, CreateUserInput, UpdateUserInput, ApiResponse, PaginatedResponse } from "@/types/admin";
import { asyncCatch } from "@/utils/try";

const adminUserRouting = Router();
adminUserRouting.use(adminAuthentication());

// Create user
adminUserRouting.post("/create-user", async (req: Request<{}, {}, CreateUserInput>, res: Response<ApiResponse>): Promise<void> => {
   const { email, password, firstName, lastName, role } = req.body;

   const [findError, findUser] = await asyncCatch(() => prisma.users.findUnique({ where: { email } }));
   if (findError) {
      res.status(500).json({ success: false, message: "Server error", error: findError });
      return;
   }
   if (findUser) {
      res.status(409).json({ success: false, message: "User already exists" });
      return;
   }

   const hashPassword = bcrypt.hashSync(password, 16);
   const [createError] = await asyncCatch(() =>
      prisma.users.create({
         data: { firstName, lastName, email, role, userAuth: { create: { method: "password", password: hashPassword } } },
      }),
   );
   if (createError) {
      res.status(500).json({ success: false, message: "Server error", error: createError });
      return;
   }

   res.status(200).json({ success: true, message: "User created successfully" });
});

// Update user
adminUserRouting.put("/update-user/:id", async (req: Request<{ id: string }, {}, UpdateUserInput>, res: Response<ApiResponse>): Promise<void> => {
   const { id } = req.params;
   const body = req.body;

   const [updateError, updateUser] = await asyncCatch(() =>
      prisma.users.update({
         where: { id: +id },
         data: { firstName: body.firstName, lastName: body.lastName, email: body.email, role: body.role },
      }),
   );
   if (updateError) {
      res.status(500).json({ success: false, message: "Server error", error: updateError });
      return;
   }
   if (!updateUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
   }

   res.status(200).json({ success: true, message: "User updated successfully" });
});

// Read user
adminUserRouting.get("/read-user/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const { id } = req.params;

   const [error, user] = await asyncCatch(() => prisma.users.findUnique({ where: { id: +id } }));
   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }
   if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
   }

   res.status(200).json({ success: true, user });
});

// Delete user
adminUserRouting.delete("/delete-user/:id", async (req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> => {
   const { id } = req.params;

   const [error] = await asyncCatch(() => prisma.users.delete({ where: { id: +id } }));
   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   res.status(200).json({ success: true, message: "User deleted successfully" });
});

// User list with pagination
adminUserRouting.get("/user-list", async (req: Request<{}, {}, {}, UserListQuery>, res: Response<PaginatedResponse<any>>): Promise<void> => {
   const { page = 1, limit = 25, search = "", role = "all", column = "createdAt", sortOrder = "desc" } = req.query;

   // Build search conditions
   const conditions: any = {};
   if (search) {
      conditions.OR = [
         { email: { contains: search, mode: "insensitive" } },
         { firstName: { contains: search, mode: "insensitive" } },
         { lastName: { contains: search, mode: "insensitive" } },
      ];
   }

   if (role && role !== "all") {
      conditions.role = role;
   } else if (!role) {
      conditions.role = { not: "user" };
   }

   const orderBy = column ? { [column]: sortOrder } : undefined;

   const [error, result] = await asyncCatch(() =>
      Promise.all([
         prisma.users.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            orderBy,
         }),
         prisma.users.count({ where: conditions }),
         prisma.users.count(),
      ]),
   );
   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   const [users, filterCount, totalCount] = result as [any[], number, number];
   res.status(200).json({
      success: true,
      data: {
         users: users || [],
         pagination: {
            page: +page,
            limit: +limit,
            total: totalCount,
         },
      },
      filterCount,
      totalCount,
      message: "Users retrieved successfully",
   });
});

// Customer list (role: 'user') with pagination
adminUserRouting.get("/customer-list", async (req: Request<{}, {}, {}, UserListQuery>, res: Response<PaginatedResponse<any>>): Promise<void> => {
   const { page = 1, limit = 25, search = "", column = "createdAt", sortOrder = "desc" } = req.query;
   const role = "user";

   // Build search conditions
   const conditions: any = {};
   if (search) {
      conditions.OR = [
         { email: { contains: search, mode: "insensitive" } },
         { firstName: { contains: search, mode: "insensitive" } },
         { lastName: { contains: search, mode: "insensitive" } },
      ];
   }

   if (role) {
      conditions.role = role;
   }

   const orderBy = column ? { [column]: sortOrder } : undefined;

   const [error, result] = await asyncCatch(() =>
      Promise.all([
         prisma.users.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            orderBy,
         }),
         prisma.users.count({ where: conditions }),
         prisma.users.count(),
      ]),
   );
   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   const [users, filterCount, totalCount] = result as [any[], number, number];
   res.status(200).json({
      success: true,
      data: {
         users: users || [],
         pagination: {
            page: +page,
            limit: +limit,
            total: totalCount,
         },
      },
      filterCount,
      totalCount,
      message: "Customers retrieved successfully",
   });
});

export default adminUserRouting;
