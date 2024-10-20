import { Router, Request, Response, response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/config/prisma';
import { adminAuthentication } from '@/middleware';

const adminUserRouting = Router()
adminUserRouting.use(adminAuthentication())
adminUserRouting.post('/create-user', async (req: Request, res: Response) => {
   try {
      const body = req.body;
      const findUser = await prisma.users.findUnique({
         where: { email: body.email }
      })
      if (findUser) res.status(409).send({ success: false, message: "User already exists" })
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
      if (!newUser) res.status(409).json({ success: false, message: "Not create user" })
      res.status(200).send({ success: true, message: `Successfully create user` });
   } catch (error) {
      res.status(500).send(error)
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

adminUserRouting.get('/managements-list', async (req: Request<{}, {}, {}, ManagementsListQuery>, res: Response) => {
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
      res.status(200).json({ success: true, users, filterCount, totalCount, message: 'Successfully' })
   } catch (error) {
      res.status(500).json({ success: false, message: 'Something error', error })
   }
})

export default adminUserRouting