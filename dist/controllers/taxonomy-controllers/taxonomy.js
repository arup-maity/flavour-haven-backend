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
const publicTaxonomyRouting = (0, express_1.Router)();
publicTaxonomyRouting.get("/tab-menu", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categories } = req.query;
        const tabMenu = yield prisma_1.default.taxonomy.findMany({
            where: {
                slug: {
                    in: categories, // Apply filter if categoryArray is not empty
                },
            },
            include: {
                dishes: {
                    include: {
                        dish: {
                            select: {
                                title: true,
                                price: true,
                                thumbnail: true,
                                nonVeg: true
                            }
                        }
                    }
                }
            }
        });
        // res.json(tabMenu);
        res.status(200).json({ success: true, tabMenu });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
exports.default = publicTaxonomyRouting;
