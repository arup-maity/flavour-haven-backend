import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';
import { userAuthentication } from '@/middleware';

const checkoutRouting = Router()


// Define an interface for the items in the checkout body
interface CheckoutItem {
   dishId: number;   // Assuming dishId is a number
   quantity: number; // Assuming quantity is a number
   price: number;    // Assuming price is a number
}

// Define an interface for the request body
interface CreateCheckoutRequest {
   items: CheckoutItem[]; // The body should have an array of CheckoutItem
}

checkoutRouting.post("/create-checkout", async (req: Request<{}, {}, CreateCheckoutRequest>, res: Response) => {
   try {
      const body = req.body.items; // Accessing the items array from the body
      console.log(body);

      const userId = 4; // Replace with actual user ID from your auth logic
      const totalAmount = body.reduce((total, dish) => {
         return total + dish.price * dish.quantity;
      }, 0);

      const createCheckout = await prisma.order.create({
         data: {
            userId: +userId,
            totalAmount,
            orderItems: {
               create: body.map((item) => ({
                  dishes: { connect: { id: item.dishId } },
                  quantity: item.quantity,
                  price: item.price
               })),
            }
         }
      });

      res.status(200).json({ success: true, orderId: createCheckout.id }); // Optionally return the order ID
   } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error });
   }
});

export default checkoutRouting