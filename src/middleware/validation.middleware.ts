import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";

type ZodSchema = z.ZodTypeAny;

export const validate = (schema: ZodSchema) => {
   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
            file: req.file,
         });
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue) => ({
               path: issue.path.join("."),
               message: issue.message,
            }));
            res.status(400).json({
               success: false,
               message: "Validation error",
               errors: errorMessages,
            });
            return;
         }
         res.status(500).json({
            success: false,
            message: "Internal server error during validation",
         });
         return;
      }
   };
};

export const validateBody = (schema: ZodSchema) => {
   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         await schema.parseAsync(req.body);
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue) => ({
               path: issue.path.join("."),
               message: issue.message,
            }));
            res.status(400).json({
               success: false,
               message: "Validation error",
               errors: errorMessages,
            });
            return;
         }
         res.status(500).json({
            success: false,
            message: "Internal server error during validation",
         });
         return;
      }
   };
};

export const validateQuery = (schema: ZodSchema) => {
   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         await schema.parseAsync(req.query);
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue) => ({
               path: issue.path.join("."),
               message: issue.message,
            }));
            res.status(400).json({
               success: false,
               message: "Validation error",
               errors: errorMessages,
            });
            return;
         }
         res.status(500).json({
            success: false,
            message: "Internal server error during validation",
         });
         return;
      }
   };
};

export const validateParams = (schema: ZodSchema) => {
   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         await schema.parseAsync(req.params);
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue) => ({
               path: issue.path.join("."),
               message: issue.message,
            }));
            res.status(400).json({
               success: false,
               message: "Validation error",
               errors: errorMessages,
            });
            return;
         }
         res.status(500).json({
            success: false,
            message: "Internal server error during validation",
         });
         return;
      }
   };
};
