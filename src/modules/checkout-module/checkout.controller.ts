import { Router } from "express";
import { userAuthentication, validate } from "@/middleware";
import * as CheckoutService from "./checkout.service";
import { createCheckoutSchema, getCheckoutIdSchema, createPaymentSchema, webhookQuerySchema } from "./dto/checkout.dto";

const checkoutRouting = Router();

checkoutRouting.post("/create-checkout", userAuthentication(), validate(createCheckoutSchema), CheckoutService.createCheckout);
checkoutRouting.get("/checkout-details/:id", validate(getCheckoutIdSchema), CheckoutService.getCheckoutDetails);
checkoutRouting.post("/create-payment", validate(createPaymentSchema), CheckoutService.createPayment);
checkoutRouting.get("/webhook", validate(webhookQuerySchema), CheckoutService.handleWebhook);

export default checkoutRouting;
