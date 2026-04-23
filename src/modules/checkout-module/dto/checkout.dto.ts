import { z } from "zod";

export const createCheckoutSchema = z.object({
   body: z.object({
      items: z
         .array(
            z.object({
               dishId: z.number().int().positive("Dish ID must be positive"),
               quantity: z.number().int().positive("Quantity must be positive"),
               price: z.number().min(0, "Price must be non-negative"),
            }),
         )
         .min(1, "At least one item is required"),
   }),
});

export const getCheckoutIdSchema = z.object({
   params: z.object({
      id: z.string().min(1, "Checkout ID is required"),
   }),
});

export const createPaymentSchema = z.object({
   body: z.object({
      checkoutId: z.string().min(1, "Checkout ID is required"),
      amount: z.number().min(0, "Amount must be non-negative"),
   }),
});

export const webhookQuerySchema = z.object({
   query: z.object({
      instance: z.string().optional(),
   }),
});

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;
export type GetCheckoutIdDto = z.infer<typeof getCheckoutIdSchema>;
export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type WebhookQueryDto = z.infer<typeof webhookQuerySchema>;
