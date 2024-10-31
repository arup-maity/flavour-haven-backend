export interface User {
   id: number;
   email: string;
   name: string;
 }

declare global {
   namespace Express {
     interface Request {
       user?: User;
     }
   }
 }