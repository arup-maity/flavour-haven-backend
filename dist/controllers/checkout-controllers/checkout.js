"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../config/prisma"));
const payment_1 = require("../../config/payment");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SK);
const checkoutRouting = (0, express_1.Router)();
checkoutRouting.post("/create-checkout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        console.log(body);
        const userId = 6;
        const createCheckout = yield prisma_1.default.order.create({
            data: {
                userId: +userId,
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
        });
        if (!createCheckout) {
            res.status(409).json({ success: false, message: "Checkout not created" });
        }
        const checkoutItems = createCheckout.orderItems;
        const totalAmount = checkoutItems.reduce((total, dish) => {
            return total + dish.price * dish.quantity;
        }, 0);
        // Update total amount
        const updateCheckout = yield prisma_1.default.order.update({
            where: { id: createCheckout.id },
            data: { totalAmount },
        });
        if (!updateCheckout) {
            res.status(409).json({ success: false, message: "Total amount not updated" });
        }
        res.status(200).json({ success: true, orderId: createCheckout.cuid });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
}));
checkoutRouting.get("/checkout-details/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = req.params.id;
        const checkout = yield prisma_1.default.order.findUnique({
            where: { cuid: orderId },
            include: {
                orderItems: {
                    include: {
                        dishes: true
                    }
                }
            }
        });
        if (!checkout)
            res.status(404).json({ success: false, message: 'Checkout not found' });
        res.status(200).json({ success: true, checkout });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}));
checkoutRouting.post("/create-payment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const metadata = {
            checkoutId: body.checkoutId,
            // shippingAddress: body.shippingAddress
        };
        const secret = yield (0, payment_1.createSecret)(body.amount, 'inr', metadata);
        res.status(200).json({ success: true, message: '', secret });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: true, error });
    }
}));
checkoutRouting.get("/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { instance } = req.query;
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
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error });
    }
}));
exports.default = checkoutRouting;
