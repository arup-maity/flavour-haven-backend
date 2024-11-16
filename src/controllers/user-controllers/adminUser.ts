import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/config/prisma';
import { adminAuthentication } from '@/middleware';

const adminUserRouting = Router()
adminUserRouting.use(adminAuthentication())
adminUserRouting.post('/create-user', async (req: Request, res: Response): Promise<any> => {
   try {
      const body = req.body;
      const findUser = await prisma.users.findUnique({
         where: { email: body.email }
      })
      if (findUser) return res.status(409).json({ success: false, message: "User already exists" })
      const hashPassword = bcrypt.hashSync(body.password, 16)
      const newUser = await prisma.users.create({
         data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            role: body.role,
            userAuth: {
               create: {
                  method: "password",
                  password: hashPassword
               }
            }
         }
      })
      if (!newUser) return res.status(409).json({ success: false, message: "Not create user" })
      return res.status(200).json({ success: true, message: `Successfully create user` });
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error })
   }
})
adminUserRouting.put("/update-user/:id", async (req, res): Promise<any> => {
   try {
      const id = req.params.id;
      const body = req.body;
      const updateUser = await prisma.users.update({
         where: { id: +id },
         data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            role: body.role
         }
      })
      if (!updateUser) return res.status(409).json({ success: false, message: "Not found user" })
      return res.status(200).json({ success: true, message: `Successfully update user` });
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error })
   }
})
adminUserRouting.get('/read-user/:id', async (req: Request, res: Response): Promise<any> => {
   try {
      const id = req.params.id;
      const user = await prisma.users.findUnique({
         where: { id: +id }
      })
      if (!user) return res.status(409).json({ success: false, message: "Not found user" })
      return res.status(200).json({ success: true, user });
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error })
   }
})
adminUserRouting.delete("/delete-user/:id", async (req: Request, res: Response): Promise<any> => {
   try {
      const id = req.params.id;
      const deleteUser = await prisma.users.delete({
         where: { id: +id }
      })
      if (!deleteUser) return res.status(409).json({ success: false, message: "Not found user" })
      return res.status(200).json({ success: true, message: `Successfully delete user` });
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error })
   }
})
interface ManagementsListQuery {
   page?: string;      // Query parameters are typically strings
   limit?: string;     // Using strings for query parameters
   search?: string;
   role?: string;
   column?: string;
   sortOrder?: 'asc' | 'desc'; // Specify possible sort orders
}
interface UserResponse {
   success: boolean;
   users?: any[];
   filterCount?: number;
   totalCount?: number;
   message: string;
   error?: any;
}
adminUserRouting.get('/managements-list', async (req: Request<{}, {}, {}, ManagementsListQuery>, res: Response): Promise<any> => {
   try {
      const { page = 1, limit = 25, search = '', role = "all", column = 'createdAt', sortOrder = 'desc' } = req.query
      const conditions: any = {}
      if (search) {
         conditions.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
         ]
      }
      if (role && role !== "all") {
         conditions.role = role
      } else {
         conditions.role = { not: "user" }
      }
      const query: any = {}
      if (column && sortOrder) {
         query.orderBy = { [column]: sortOrder }
      }
      const users = await prisma.users.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      })
      const [filterCount, totalCount] = await Promise.all([
         prisma.users.count({ where: conditions }),
         prisma.users.count(),
      ]);
      return res.status(200).json({ success: true, users, filterCount, totalCount, message: 'Successfully' })
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Something error', error })
   }
})
adminUserRouting.get('/customer-list', async (req: Request<{}, {}, {}, ManagementsListQuery>, res: Response): Promise<any> => {
   try {
      const { page = 1, limit = 25, search = '', column = 'createdAt', sortOrder = 'desc' } = req.query
      const conditions: any = {}
      conditions.role = "user"
      if (search) {
         conditions.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
         ]
      }
      const query: any = {}
      if (column && sortOrder) {
         query.orderBy = { [column]: sortOrder }
      }
      const users = await prisma.users.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      })
      const [filterCount, totalCount] = await Promise.all([
         prisma.users.count({ where: conditions }),
         prisma.users.count(),
      ]);
      return res.status(200).json({ success: true, users, filterCount, totalCount, message: 'Successfully' })
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Something error', error })
   }
})

export default adminUserRouting