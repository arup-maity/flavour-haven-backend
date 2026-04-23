import { z } from "zod";

export const orderListQuerySchema = z.object({
   query: z.object({
      search: z.string().max(255, "Search term must be less than 255 characters").optional(),
      column: z.string().optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional().default(1),
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(15),
   }),
});

export const getOrderIdSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
});

export const updateOrderStatusSchema = z.object({
   params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
   }),
   body: z.object({
      status: z.string().min(1, "Status is required"),
   }),
});

export type OrderListQueryDto = z.infer<typeof orderListQuerySchema>;
export type GetOrderIdDto = z.infer<typeof getOrderIdSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
