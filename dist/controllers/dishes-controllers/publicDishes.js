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
const publicDishesRouting = (0, express_1.Router)();
publicDishesRouting.get('/delivery-dishes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sort = '', veg = false, page = 1, limit = 15 } = req.query;
        const conditions = {};
        // if (search) {
        //    conditions.title = {
        //       contains: search,
        //       mode: "insensitive"
        //    }
        // }
        if (veg) {
            conditions.veg = true;
        }
        const query = {};
        // if (column && sortOrder) {
        //    query.orderBy = { [column]: sortOrder }
        // }
        const dishes = yield prisma_1.default.dishes.findMany(Object.assign({ where: conditions, include: {
                categories: {
                    include: {
                        taxonomy: true
                    }
                }
            }, take: +limit, skip: (+page - 1) * +limit }, query));
        const count = yield prisma_1.default.dishes.count({ where: conditions, });
        res.status(200).send({ success: true, dishes, total: count });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
publicDishesRouting.get('/all-dishes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sort = '', veg = false, page = 1, limit = 15 } = req.query;
        console.log(req.query);
        const conditions = {};
        // if (search) {
        //    conditions.title = {
        //       contains: search,
        //       mode: "insensitive"
        //    }
        // }
        if (veg) {
            conditions.veg = true;
        }
        const query = {};
        // if (column && sortOrder) {
        //    query.orderBy = { [column]: sortOrder }
        // }
        const dishes = yield prisma_1.default.dishes.findMany(Object.assign({ where: conditions, include: {
                categories: {
                    include: {
                        taxonomy: true
                    }
                }
            }, take: +limit, skip: (+page - 1) * +limit }, query));
        const count = yield prisma_1.default.dishes.count({ where: conditions, });
        res.status(200).send({ success: true, dishes, total: count });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
publicDishesRouting.get("/dish-details/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const dish = yield prisma_1.default.dishes.findUnique({
            where: { slug },
            include: {
                categories: true
            }
        });
        res.status(200).json({ success: true, dish });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: true, message: 'Internal Server Error' });
    }
}));
exports.default = publicDishesRouting;
