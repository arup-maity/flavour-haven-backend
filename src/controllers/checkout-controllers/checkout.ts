import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';
import { userAuthentication } from '@/middleware';
import { createSecret } from '@/config/payment';
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SK as string)
const checkoutRouting = Router()



// Define an interface for each item in the checkout
interface CheckoutItem {
   dishId: number;
   quantity: number;
   price: number;
}

// Define an interface for the request body
interface CreateCheckoutRequest {
   items: CheckoutItem[];
}

checkoutRouting.post("/create-checkout", userAuthentication(), async (req: Request, res: Response): Promise<any> => {
   try {
      const user = req.user
      const body = req.body;

      const createCheckout = await prisma.order.create({
         data: {
            userId: +user.id,
            orderItems: {
               create: body.map((item: { [key: string]: number | string }) => ({
                  dishes: { connect: { id: item.dishId } },
                  quantity: item.quantity,
                  price: item.price,
               })),
            },
         },
         include: {
            orderItems: true,
         },
      });

      if (!createCheckout) return res.status(409).json({ success: false, message: "Checkout not created" });

      const checkoutItems = createCheckout.orderItems;
      const totalAmount = checkoutItems.reduce((total, dish) => {
         return total + dish.price * dish.quantity;
      }, 0);

      // Update total amount
      const updateCheckout = await prisma.order.update({
         where: { id: createCheckout.id },
         data: { totalAmount },
      });

      if (!updateCheckout) {
         res.status(409).json({ success: false, message: "Total amount not updated" });
      }

      return res.status(200).json({ success: true, checkoutId: createCheckout.cuid });
      // return res.status(200).json({ success: true, message: 'Checkout updated successfully' })
   } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error', error });
   }
});

checkoutRouting.get("/checkout-details/:id", async (req, res): Promise<any> => {
   try {
      const orderId = req.params.id;
      const checkout = await prisma.order.findUnique({
         where: { cuid: orderId },
         include: {
            orderItems: {
               include: {
                  dishes: true
               }
            }
         }
      })
      if (!checkout) return res.status(404).json({ success: false, message: 'Checkout not found' })
      return res.status(200).json({ success: true, checkout })
   } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' })
   }
})

checkoutRouting.post("/create-payment", async (req, res) => {
   try {
      const body = req.body
      const metadata = {
         checkoutId: body.checkoutId,
         // shippingAddress: body.shippingAddress
      }
      const secret = await createSecret(body.amount, 'inr', metadata)
      res.status(200).json({ success: true, message: '', secret })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: true, error })
   }
})
checkoutRouting.get("/webhook", async (req, res) => {
   try {
      const { instance } = req.query
      // const user = c.user
      // if (!user?.id) return c.json({ success: false }, 409)
      // const { instance } = c.req.query()
      // const intent = await stripe.paymentIntents.retrieve(instance);

      // const orderCuid = intent.metadata.checkoutId
      // update order
      // const updatePayment = await prisma.order.update({
      //    where: { cuid: orderCuid },
      //    data: {

      //    },
      // })
      res.status(200).json({ success: true })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error })
   }
})

export default checkoutRouting


// http://localhost:3001/checkout?checkoutId=cm4f28yad00014oic9i58j8zt