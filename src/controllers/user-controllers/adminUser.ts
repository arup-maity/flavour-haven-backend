import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/config/prisma';
import { adminAuthentication } from '@/middleware';

const adminUserRouting = Router()

adminUserRouting.post('/create-user', adminAuthentication(), async (req: Request, res: Response) => {
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

export default adminUserRouting