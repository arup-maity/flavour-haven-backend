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
const checkoutRouting = (0, express_1.Router)();
checkoutRouting.post("/create-checkout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body.items; // Accessing the items array from the body
        console.log(body);
        const userId = 4; // Replace with actual user ID from your auth logic
        const totalAmount = body.reduce((total, dish) => {
            return total + dish.price * dish.quantity;
        }, 0);
        const createCheckout = yield prisma_1.default.order.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
}));
exports.default = checkoutRouting;
