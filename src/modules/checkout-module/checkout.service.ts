import { Request, Response, NextFunction } from "express";
import prisma from "@/config/prisma";
import { catchAsync } from "@/utils/try";
import { createSecret } from "@/config/payment";
import Stripe from "stripe";
import { CreateCheckoutBody, CreatePaymentBody } from "./interface/checkout.interface";

const stripe = new Stripe(process.env.STRIPE_SK as string);

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncRequestHandler) => {
   return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
   };
};

export const createCheckout = asyncHandler(async (req: Request<{}, {}, CreateCheckoutBody>, res: Response): Promise<void> => {
   const user = (req as any).user;
   const body = req.body;

   if (!user || !user.id) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
   }

   const [createErr, createCheckout] = await catchAsync(
      prisma.order.create({
         data: {
            userId: +user.id,
            orderItems: {
               create: body.items.map((item) => ({
                  dishes: { connect: { id: item.dishId } },
                  quantity: item.quantity,
                  price: item.price,
               })),
            },
         },
         include: {
            orderItems: true,
         },
      }),
   );

   if (createErr) {
      res.status(500).json({ success: false, message: "Database error", error: createErr });
      return;
   }

   if (!createCheckout) {
      res.status(409).json({ success: false, message: "Checkout not created" });
      return;
   }

   const checkoutItems = createCheckout.orderItems;
   const totalAmount = checkoutItems.reduce((total, dish) => {
      return total + dish.price * dish.quantity;
   }, 0);

   const [updateErr] = await catchAsync(
      prisma.order.update({
         where: { id: createCheckout.id },
         data: { totalAmount },
      }),
   );

   if (updateErr) {
      res.status(500).json({ success: false, message: "Failed to update total amount", error: updateErr });
      return;
   }

   res.status(200).json({ success: true, checkoutId: createCheckout.cuid });
});

export const getCheckoutDetails = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const orderId = req.params.id;

   const [err, checkout] = await catchAsync(
      prisma.order.findUnique({
         where: { cuid: orderId },
         include: {
            orderItems: {
               include: {
                  dishes: true,
               },
            },
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Database error", error: err });
      return;
   }

   if (!checkout) {
      res.status(404).json({ success: false, message: "Checkout not found" });
      return;
   }

   res.status(200).json({ success: true, checkout });
});

export const createPayment = asyncHandler(async (req: Request<{}, {}, CreatePaymentBody>, res: Response): Promise<void> => {
   const body = req.body;

   const metadata = {
      checkoutId: body.checkoutId,
   };

   const [err, secret] = await catchAsync(createSecret(body.amount, "inr", metadata));

   if (err) {
      res.status(500).json({ success: false, message: "Failed to create payment intent", error: err });
      return;
   }

   res.status(200).json({ success: true, message: "Payment intent created", secret });
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const { instance } = req.query;

   res.status(200).json({ success: true });
});
