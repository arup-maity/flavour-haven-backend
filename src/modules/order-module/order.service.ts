import { Request, Response, NextFunction } from "express";
import prisma from "@/config/prisma";
import { catchAsync } from "@/utils/try";
import { OrderListQuery, UpdateOrderStatusBody } from "./interface/order.interface";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncRequestHandler) => {
   return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
   };
};

export const getOrderList = asyncHandler(async (req: Request<{}, {}, {}, OrderListQuery>, res: Response): Promise<void> => {
   const { search, column = "createdAt", sortOrder = "desc", page = "1", limit = "15" } = req.query;

   const conditions: any = {};
   if (search) {
      conditions.title = {
         contains: search,
         mode: "insensitive",
      };
   }

   const query: any = {};
   if (column && sortOrder) {
      query.orderBy = { [column]: sortOrder };
   }

   const [err, orders] = await catchAsync(
      prisma.order.findMany({
         where: conditions,
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true,
               },
            },
            paymentMethod: true,
         },
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      }),
   );

   if (err) {
      res.status(500).json({ success: false, error: err });
      return;
   }

   res.status(200).json({ success: true, orders });
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const [err, orders] = await catchAsync(
      prisma.order.findMany({
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true,
               },
            },
            paymentMethod: true,
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, error: err });
      return;
   }

   res.status(200).json({ success: true, orders });
});

export const getOrderById = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const id = req.params.id;

   const [err, order] = await catchAsync(
      prisma.order.findUnique({
         where: { id: +id },
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true,
               },
            },
            paymentMethod: true,
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Database error", error: err });
      return;
   }

   if (!order) {
      res.status(409).json({ success: true, message: "Orders not found" });
      return;
   }

   res.status(200).json({ success: true, order });
});

export const updateOrderStatus = asyncHandler(async (req: Request<{ id: string }, {}, UpdateOrderStatusBody>, res: Response): Promise<void> => {
   const id = req.params.id;
   const { status } = req.body;

   const [err, updatedOrder] = await catchAsync(
      prisma.order.update({
         where: { id: +id },
         data: { status: status as any },
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true,
               },
            },
            paymentMethod: true,
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, error: err });
      return;
   }

   if (!updatedOrder) {
      res.status(409).json({ success: false, message: "Not found" });
      return;
   }

   res.status(200).json({ success: true, message: "Order status updated successfully", updatedOrder });
});
