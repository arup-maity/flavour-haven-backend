import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/config/prisma';
import { validateData } from '@/utils';
import { adminLogin } from '@/validation/adminUserValidation';
import jwt from 'jsonwebtoken'

const authRouting = Router()
authRouting.get('/verify-token', async (req, res) => {
   try {
      const cookie_token = req.cookies.token
      function getToken() {
         const authorization = req.headers['authorization']
         if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(409).send({ login: false, message: 'token not found' })
         } else {
            return authorization.split(' ')[1]
         }
      }

      const token = cookie_token || getToken() as string
      if (!token) {
         res.status(409).send({ success: false, message: "No token provided" })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { [key: string]: any }
      if (decoded?.purpose !== 'login') res.status(409).json({ success: false, login: false, message: 'this token not for login purpose' })

      res.status(200).send({ success: false, login: true, decoded })
   } catch (error) {
      console.error(error)
      res.status(500).send({ success: false, message: "Failed to authenticate token" })
   }
})
authRouting.post('/admin-login', validateData(adminLogin), async (req: Request, res: Response) => {
   try {
      const body = req.body
      // find username
      const findUser = await prisma.users.findUnique({
         where: { email: body.email },
         include: {
            userAuth: true
         }
      })
      if (!findUser) res.status(409).send({ success: false, message: "User not found" })
      // check password
      const checkPassword = bcrypt.compareSync(body?.password, findUser?.userAuth?.password as string)
      if (!checkPassword) res.status(409).send({ success: false, message: "Not match username and password" })
      // 
      const payload = {
         id: findUser?.id,
         name: findUser?.firstName ? findUser?.firstName + " " + findUser?.lastName : '',
         role: findUser?.role,
         accessPurpose: 'admin',
         purpose: 'login',
         exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6,
      }
      // generate the token
      const token = jwt.sign(payload, process.env.JWT_SECRET as string)
      res.cookie('token', token, {
         domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
         path: '/',
         secure: true,
         httpOnly: false,
         maxAge: 30 * 24 * 60 * 60,
      })
      //  return response
      res.status(200).send({ success: true, message: 'Login successfull' })
   } catch (error) {
      console.log(error)
      res.status(500).send({ success: false, error })
   }
})

export default authRouting