import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/config/prisma';
import { validateData } from '@/utils';
import { adminLogin } from '@/validation/adminUserValidation';
import jwt from 'jsonwebtoken'
import { TokenType } from '@/type';

const authRouting = Router()

export function cookieParams() {
   return {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
   };
}
authRouting.get('/verify-token', async (req: Request, res: Response): Promise<any> => {
   try {
      const cookieToken = req.cookies.token;

      const getToken = () => {
         const authorization = req.headers['authorization'];
         if (authorization && authorization.startsWith('Bearer ')) {
            return authorization.split(' ')[1];
         }
         return null;
      };

      const token = cookieToken || getToken();
      if (!token) return res.status(409).json({ success: false, message: "No token provided" });
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenType
      if (decoded?.purpose !== 'login') return res.status(401).json({ success: false, login: false, message: 'This token is not for login purposes' });

      return res.status(200).json({ success: true, login: true, decoded });
   } catch (error) {
      console.error('verify token', error)
      return res.status(500).json({ success: false, message: "Failed to authenticate token" })
   }
})
authRouting.post('/admin-login', validateData(adminLogin), async (req: Request, res: Response): Promise<any> => {
   try {
      const body = req.body
      // find username
      const findUser = await prisma.users.findUnique({
         where: { email: body.email },
         include: {
            userAuth: true
         }
      })
      if (!findUser) return res.status(409).send({ success: false, message: "User not found" })
      // check password
      const checkPassword = bcrypt.compareSync(body?.password, findUser?.userAuth?.password as string)
      if (!checkPassword) return res.status(409).send({ success: false, message: "Not match username and password" })
      // 
      const payload = {
         id: findUser?.id,
         name: `${findUser?.firstName} ${findUser?.lastName}`,
         role: findUser?.role,
         accessPurpose: 'admin',
         purpose: 'login',
      }
      // generate the token
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' })
      res.cookie('token', token, {
         domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
         path: '/',
         secure: true,
         httpOnly: false,
         maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      //  return response
      return res.status(200).send({ success: true, message: 'Login successfull' })
   } catch (error) {
      console.log(error)
      return res.status(500).send({ success: false, error })
   }
})
authRouting.post("/user-register", async (req: Request, res: Response) => {
   try {
      const body = req.body;
      // Check if user already exists
      const checkUser = await prisma.users.findUnique({
         where: { email: body.email }
      });
      if (checkUser) res.status(409).json({ success: false, message: "User already exists" });
      // Hash the password
      const hashPassword = bcrypt.hashSync(body.password, 10); // Consider using a higher value for production
      // Create the new user
      const newUser = await prisma.users.create({
         data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            role: 'user',
            isActive: true,
            userAuth: {
               create: {
                  method: "password",
                  password: hashPassword
               }
            }
         }
      });

      res.status(201).json({ success: true, user: newUser, message: 'Account created successfully' });
   } catch (error) {
      console.error(error); // Log error for debugging
      res.status(500).send({ success: false, message: "Internal server error" });
   }
});
authRouting.post("/user-login", async (req, res) => {
   try {
      const body = req.body
      const findUser = await prisma.users.findUnique({
         where: { email: body.email },
         include: {
            userAuth: true
         }
      })
      if (!findUser) res.status(409).json({ success: false, message: "User not found" })
      const checkPassword = bcrypt.compareSync(body?.password, findUser?.userAuth?.password as string)
      if (!checkPassword) res.status(409).json({ success: false, message: "Not match username and password" })
      const payload = {
         id: findUser?.id,
         name: findUser?.firstName ? findUser?.firstName + " " + findUser?.lastName : '',
         role: findUser?.role,
         accessPurpose: 'user',
         purpose: 'login',
      }
      // generate the token
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' })
      res.cookie('token', token, {
         domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
         path: '/',
         secure: true,
         httpOnly: false,
         maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      res.status(200).json({ success: true, message: 'Login successful' })
   } catch (error) {
      console.log(error)
      res.status(500).send({ success: false, error })

   }
})
export default authRouting