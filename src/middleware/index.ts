// admin
import jwt from 'jsonwebtoken'

import { Request, Response, NextFunction } from "express";
import { TokenType } from '@/type';
export const adminAuthentication = () => {
   return (req: Request, res: Response, next: NextFunction) => {
      try {
         const token = req.cookies.token
         const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenType
         if (decoded?.purpose !== 'login' && decoded.accessPurpose === 'admin') res.status(409).json({ success: false, login: false, message: 'this token not for login purpose' })
         req.user = decoded
         next();
      } catch (error) {
         res.status(500).json({ error: 'Internal Server Error' });
      }
   };
}
export const userAuthentication = () => {
   return (req: Request, res: Response, next: NextFunction) => {
      try {
         const token = req.cookies.token
         const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenType
         if (decoded?.purpose !== 'login') res.status(409).json({ success: false, login: false, message: 'this token not for login purpose' })
         req.user = decoded
         next();
      } catch (error) {
         res.status(500).json({ error: 'Internal Server Error' });
      }
   };
}