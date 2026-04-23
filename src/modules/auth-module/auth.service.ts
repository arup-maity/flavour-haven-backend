import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/config/prisma";
import { catchAsync } from "@/utils/try";
import { TokenType } from "@/type";
import { AdminLoginBody, UserRegisterBody, UserLoginBody } from "./interface/auth.interface";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncRequestHandler) => {
   return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
   };
};

export function cookieParams() {
   return {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: true,
      sameSite: "strict" as const,
      domain: process.env.ENVIRONMENT === "production" ? ".arupmaity.in" : "localhost",
   };
}

export const verifyToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const cookieToken = req.cookies.token;

   const getToken = () => {
      const authorization = req.headers["authorization"];
      if (authorization && authorization.startsWith("Bearer ")) {
         return authorization.split(" ")[1];
      }
      return null;
   };

   const token = cookieToken || getToken();
   if (!token) {
      res.status(409).json({ success: false, message: "No token provided" });
      return;
   }

   const [err, decoded] = await catchAsync(
      Promise.resolve(jwt.verify(token, process.env.JWT_SECRET as string) as TokenType),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Failed to authenticate token" });
      return;
   }

   if (decoded?.purpose !== "login") {
      res.status(401).json({ success: false, login: false, message: "This token is not for login purposes" });
      return;
   }

   res.status(200).json({ success: true, login: true, decoded });
});

export const adminLogin = asyncHandler(async (req: Request<{}, {}, AdminLoginBody>, res: Response): Promise<void> => {
   const { email, password } = req.body;

   const [findErr, findUser] = await catchAsync(
      prisma.users.findUnique({
         where: { email },
         include: {
            userAuth: true,
         },
      }),
   );

   if (findErr) {
      res.status(500).json({ success: false, message: "Database error", error: findErr });
      return;
   }

   if (!findUser) {
      res.status(409).json({ success: false, message: "User not found" });
      return;
   }

   const [checkPasswordErr, isPasswordValid] = await catchSync(() => bcrypt.compareSync(password, findUser?.userAuth?.password as string));

   if (checkPasswordErr) {
      res.status(500).json({ success: false, message: "Password verification error", error: checkPasswordErr });
      return;
   }

   if (!isPasswordValid) {
      res.status(409).json({ success: false, message: "Not match username and password" });
      return;
   }

   const payload = {
      id: findUser?.id,
      name: `${findUser?.firstName} ${findUser?.lastName}`,
      role: findUser?.role,
      accessPurpose: "admin",
      purpose: "login",
   };

   const [tokenErr, token] = await catchAsync(Promise.resolve(jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" })));

   if (tokenErr) {
      res.status(500).json({ success: false, message: "Token generation error", error: tokenErr });
      return;
   }

   res.cookie("token", token, {
      domain: process.env.ENVIRONMENT === "production" ? ".arupmaity.in" : "localhost",
      path: "/",
      secure: true,
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
   });

   res.status(200).json({ success: true, message: "Login successfull" });
});

export const userRegister = asyncHandler(async (req: Request<{}, {}, UserRegisterBody>, res: Response): Promise<void> => {
   const { email, password, firstName, lastName } = req.body;

   const [checkErr, checkUser] = await catchAsync(prisma.users.findUnique({ where: { email } }));

   if (checkErr) {
      res.status(500).json({ success: false, message: "Database error", error: checkErr });
      return;
   }

   if (checkUser) {
      res.status(409).json({ success: false, message: "User already exists" });
      return;
   }

   const [hashErr, hashPassword] = await catchSync(() => bcrypt.hashSync(password, 10));

   if (hashErr) {
      res.status(500).json({ success: false, message: "Password hashing error", error: hashErr });
      return;
   }

   const [createErr, newUser] = await catchAsync(
      prisma.users.create({
         data: {
            firstName,
            lastName,
            email,
            role: "user",
            isActive: true,
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
      res.status(500).json({ success: false, message: "Failed to create user", error: createErr });
      return;
   }

   if (!newUser) {
      res.status(409).json({ success: false, message: "User not created" });
      return;
   }

   res.status(201).json({ success: true, user: newUser, message: "Account created successfully" });
});

export const userLogin = asyncHandler(async (req: Request<{}, {}, UserLoginBody>, res: Response): Promise<void> => {
   const { email, password } = req.body;

   const [findErr, findUser] = await catchAsync(
      prisma.users.findUnique({
         where: { email },
         include: {
            userAuth: true,
         },
      }),
   );

   if (findErr) {
      res.status(500).json({ success: false, message: "Database error", error: findErr });
      return;
   }

   if (!findUser) {
      res.status(409).json({ success: false, message: "User not found" });
      return;
   }

   const [checkPasswordErr, isPasswordValid] = await catchSync(() => bcrypt.compareSync(password, findUser?.userAuth?.password as string));

   if (checkPasswordErr) {
      res.status(500).json({ success: false, message: "Password verification error", error: checkPasswordErr });
      return;
   }

   if (!isPasswordValid) {
      res.status(409).json({ success: false, message: "Not match username and password" });
      return;
   }

   const payload = {
      id: findUser?.id,
      name: findUser?.firstName ? findUser.firstName + " " + findUser.lastName : "",
      role: findUser?.role,
      accessPurpose: "user",
      purpose: "login",
   };

   const [tokenErr, token] = await catchAsync(Promise.resolve(jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" })));

   if (tokenErr) {
      res.status(500).json({ success: false, message: "Token generation error", error: tokenErr });
      return;
   }

   res.cookie("token", token, {
      domain: process.env.ENVIRONMENT === "production" ? ".arupmaity.in" : "localhost",
      path: "/",
      secure: true,
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
   });

   res.status(200).json({ success: true, message: "Login successful" });
});

function catchSync<T>(fn: () => T): [Error | null, T | null] {
   try {
      const data = fn();
      return [null, data];
   } catch (error) {
      return [error as Error, null];
   }
}
