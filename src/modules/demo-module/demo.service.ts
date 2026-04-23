import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import prisma from "@/config/prisma";
import { catchAsync } from "@/utils/try";
import { CreateAdminUserBody } from "./interface/demo.interface";
import { adminUserData, dishesList } from "./data";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncRequestHandler) => {
   return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
   };
};

export const createAdminUser = asyncHandler(async (req: Request<{}, {}, CreateAdminUserBody>, res: Response): Promise<void> => {
   const { email, password, firstName, lastName } = req.body;

   if (process.env.ENVIRONMENT === "production") {
      res.status(403).json({ success: false, message: "Demo operations are not allowed in production" });
      return;
   }

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
         data: {
            firstName,
            lastName,
            email,
            role: "admin",
            userAuth: {
               create: {
                  method: "password",
                  password: hashPassword,
               },
            },
         },
      }),
   );

   if (createErr) {
      res.status(500).json({ success: false, message: "Server error", error: createErr });
      return;
   }

   res.status(200).json({ success: true, message: "Admin user created successfully" });
});

export const createDemoDishes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   if (process.env.ENVIRONMENT === "production") {
      res.status(403).json({ success: false, message: "Demo operations are not allowed in production" });
      return;
   }

   const [createErr] = await catchAsync(
      Promise.all(
         dishesList.map((dish) =>
            prisma.dishes.create({
               data: dish,
            }),
         ),
      ),
   );

   if (createErr) {
      res.status(500).json({ success: false, message: "Server error", error: createErr });
      return;
   }

   res.status(200).json({ success: true, message: "Demo dishes created successfully", dishes: dishesList });
});
