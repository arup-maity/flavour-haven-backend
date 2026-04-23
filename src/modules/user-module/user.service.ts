import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import prisma from "@/config/prisma";
import { catchAsync } from "@/utils/try";
import { CreateUserBody, UpdateUserBody, UserListQuery, AddAddressBody, UpdateAddressBody, OrderListQuery } from "./interface/user.interface";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncRequestHandler) => {
   return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
   };
};

export const createUser = asyncHandler(async (req: Request<{}, {}, CreateUserBody>, res: Response): Promise<void> => {
   const { email, password, firstName, lastName, role } = req.body;

   const [findErr, findUser] = await catchAsync(prisma.users.findUnique({ where: { email } }));

   if (findErr) {
      res.status(500).json({ success: false, message: "Server error", error: findErr });
      return;
   }

   if (findUser) {
      res.status(409).json({ success: false, message: "User already exists" });
      return;
   }

   const hashPassword = bcrypt.hashSync(password, 16);

   const [createErr] = await catchAsync(
      prisma.users.create({
         data: { firstName, lastName, email, role: role as any, userAuth: { create: { method: "password", password: hashPassword } } },
      }),
   );

   if (createErr) {
      res.status(500).json({ success: false, message: "Server error", error: createErr });
      return;
   }

   res.status(200).json({ success: true, message: "User created successfully" });
});

export const updateUser = asyncHandler(async (req: Request<{ id: string }, {}, UpdateUserBody>, res: Response): Promise<void> => {
   const { id } = req.params;
   const body = req.body;

   const [updateErr, updateUser] = await catchAsync(
      prisma.users.update({
         where: { id: +id },
         data: { firstName: body.firstName, lastName: body.lastName, email: body.email, role: body.role as any },
      }),
   );

   if (updateErr) {
      res.status(500).json({ success: false, message: "Server error", error: updateErr });
      return;
   }

   if (!updateUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
   }

   res.status(200).json({ success: true, message: "User updated successfully" });
});

export const getUserById = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const { id } = req.params;

   const [error, user] = await catchAsync(prisma.users.findUnique({ where: { id: +id } }));

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

export const deleteUser = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const { id } = req.params;

   const [error] = await catchAsync(prisma.users.delete({ where: { id: +id } }));

   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   res.status(200).json({ success: true, message: "User deleted successfully" });
});

export const getUserList = asyncHandler(async (req: Request<{}, {}, {}, UserListQuery>, res: Response): Promise<void> => {
   const { page = 1, limit = 25, search = "", role = "all", column = "createdAt", sortOrder = "desc" } = req.query;

   const conditions: any = {};
   if (search) {
      conditions.OR = [{ email: { contains: search, mode: "insensitive" } }, { firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }];
   }

   if (role && role !== "all") {
      conditions.role = role;
   } else if (!role) {
      conditions.role = { not: "user" };
   }

   const orderBy = column ? { [column]: sortOrder } : undefined;

   const [error, result] = await catchAsync(
      Promise.all([prisma.users.findMany({ where: conditions, take: +limit, skip: (+page - 1) * +limit, orderBy }), prisma.users.count({ where: conditions }), prisma.users.count()]),
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

export const getCustomerList = asyncHandler(async (req: Request<{}, {}, {}, UserListQuery>, res: Response): Promise<void> => {
   const { page = 1, limit = 25, search = "", column = "createdAt", sortOrder = "desc" } = req.query;
   const role = "user";

   const conditions: any = {};
   if (search) {
      conditions.OR = [{ email: { contains: search, mode: "insensitive" } }, { firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }];
   }

   if (role) {
      conditions.role = role;
   }

   const orderBy = column ? { [column]: sortOrder } : undefined;

   const [error, result] = await catchAsync(
      Promise.all([prisma.users.findMany({ where: conditions, take: +limit, skip: (+page - 1) * +limit, orderBy }), prisma.users.count({ where: conditions }), prisma.users.count()]),
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

export const getProfileDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const user = (req as any).user;

   if (!user || !user.id) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
   }

   const [error, userDetails] = await catchAsync(
      prisma.users.findUnique({
         where: { id: user.id },
      }),
   );

   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   if (!userDetails) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
   }

   res.status(200).json({ success: true, user: userDetails });
});

export const getAddressDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const user = (req as any).user;

   if (!user || !user.id) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
   }

   const [error, addresses] = await catchAsync(
      (prisma as any).address.findMany({
         where: { userId: user.id },
      }),
   );

   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   res.status(200).json({ success: true, addresses });
});

export const addAddress = asyncHandler(async (req: Request<{}, {}, AddAddressBody>, res: Response): Promise<void> => {
   const user = (req as any).user;
   const addressData = req.body;

   if (!user || !user.id) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
   }

   const [error, address] = await catchAsync(
      (prisma as any).address.create({
         data: {
            ...addressData,
            userId: user.id,
         },
      }),
   );

   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   res.status(200).json({ success: true, message: "Address added successfully", address });
});

export const updateAddress = asyncHandler(async (req: Request<{ id: string }, {}, UpdateAddressBody>, res: Response): Promise<void> => {
   const { id } = req.params;
   const user = (req as any).user;
   const addressData = req.body;

   if (!user || !user.id) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
   }

   const [error, address] = await catchAsync(
      (prisma as any).address.update({
         where: { id: +id },
         data: addressData,
      }),
   );

   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   res.status(200).json({ success: true, message: "Address updated successfully", address });
});

export const getUserOrderList = asyncHandler(async (req: Request<{}, {}, {}, OrderListQuery>, res: Response): Promise<void> => {
   const user = (req as any).user;
   const { page = 1, limit = 15, search = "", column = "createdAt", sortOrder = "desc" } = req.query;

   if (!user || !user.id) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
   }

   const conditions: any = { userId: user.id };
   if (search) {
      conditions.title = { contains: search, mode: "insensitive" };
   }

   const orderBy = column ? { [column]: sortOrder } : undefined;

   const [error, orders] = await catchAsync(
      prisma.order.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         orderBy,
         include: {
            orderItems: {
               include: {
                  dishes: true,
               },
            },
            paymentMethod: true,
         },
      }),
   );

   if (error) {
      res.status(500).json({ success: false, message: "Server error", error });
      return;
   }

   const [countError, count] = await catchAsync(prisma.order.count({ where: conditions }));

   if (countError) {
      res.status(500).json({ success: false, message: "Server error", error: countError });
      return;
   }

   res.status(200).json({
      success: true,
      data: orders || [],
      pagination: {
         page: +page,
         limit: +limit,
         total: count,
      },
   });
});
