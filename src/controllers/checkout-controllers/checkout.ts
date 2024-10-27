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

checkoutRouting.post("/create-checkout", async (req: Request, res: Response) => {
   try {
      const body = req.body;
      console.log(body);

      const userId = 6;

      const createCheckout = await prisma.order.create({
         data: {
            userId: +userId,
            orderItems: {
               create: body.items.map((item: { [key: string]: number | string }) => ({
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

      if (!createCheckout) {
         res.status(409).json({ success: false, message: "Checkout not created" });
      }

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

      res.status(200).json({ success: true, orderId: createCheckout.cuid });
   } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error });
   }
}
);

checkoutRouting.get("/checkout-details/:id", async (req, res) => {
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
      if (!checkout) res.status(404).json({ success: false, message: 'Checkout not found' })
      res.status(200).json({ success: true, checkout })
   } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' })
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