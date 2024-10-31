// types.ts
export interface TokenType {
   id: number,
   name: string,
   role: string,
   accessPurpose: string,
   purpose: string,
   exp: number
}

declare global {
   namespace Express {
      interface Request {
         user?: TokenType;
      }
   }
}
