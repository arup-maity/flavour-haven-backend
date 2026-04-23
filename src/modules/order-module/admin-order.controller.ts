import { Router } from "express";
import { adminAuthentication, validate } from "@/middleware";
import * as OrderService from "./order.service";
import { orderListQuerySchema, getOrderIdSchema, updateOrderStatusSchema } from "./dto/order.dto";

const adminOrdersRouting = Router();
adminOrdersRouting.use(adminAuthentication());

adminOrdersRouting.get("/orders-list", validate(orderListQuerySchema), OrderService.getOrderList);
adminOrdersRouting.get("/order-request", OrderService.getAllOrders);
adminOrdersRouting.get("/read-order/:id", validate(getOrderIdSchema), OrderService.getOrderById);
adminOrdersRouting.put("/update-status/:id", validate(updateOrderStatusSchema), OrderService.updateOrderStatus);

export default adminOrdersRouting;
