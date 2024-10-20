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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../config/prisma"));
const middleware_1 = require("../../middleware");
const fileUpload_1 = require("../../config/fileUpload");
const adminDishesRouting = (0, express_1.Router)();
adminDishesRouting.use((0, middleware_1.adminAuthentication)());
adminDishesRouting.post('/create-dish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { category } = _a, rest = __rest(_a, ["category"]);
        const checkSlug = yield prisma_1.default.dishes.findUnique({
            where: { slug: rest.slug }
        });
        if (checkSlug)
            res.status(409).json({ success: false, message: "Dish slug already exists" });
        const dish = yield prisma_1.default.dishes.create({
            data: Object.assign(Object.assign({}, rest), { categories: {
                    create: category.map((id) => ({
                        taxonomy: { connect: { id: id } },
                    })),
                } })
        });
        if (!dish)
            res.status(409).json({ success: false, message: "Dish not created" });
        res.status(200).json({ success: true, message: "Dish created successfully", dish });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Something went wrong', error });
    }
}));
adminDishesRouting.put("/update-dish/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const _a = req.body, { category, oldCategory, oldThumbnail } = _a, rest = __rest(_a, ["category", "oldCategory", "oldThumbnail"]);
        const newCategoryIds = category.filter((id) => !oldCategory.includes(id));
        const removedCategoryIds = oldCategory.filter((id) => !category.includes(id));
        const checkSlug = yield prisma_1.default.dishes.findUnique({
            where: {
                slug: rest.slug,
                NOT: { id: +id }
            }
        });
        if (checkSlug)
            res.status(409).json({ success: false, message: "Slug already exists" });
        const updateDish = yield prisma_1.default.dishes.update({
            where: { id: +id },
            data: Object.assign(Object.assign({}, rest), { categories: {
                    create: newCategoryIds.map((id) => ({
                        taxonomy: { connect: { id: id } },
                    }))
                } })
        });
        yield Promise.all(removedCategoryIds.map((taxonomyId) => prisma_1.default.dishesTaxonomy.delete({
            where: { dishId_taxonomyId: { dishId: +id, taxonomyId } },
        })));
        if (!updateDish)
            res.status(409).json({ success: false, message: "Dish not updated" });
        if (oldThumbnail !== '' && oldThumbnail !== rest.thumbnail) {
            // await deleteFile('restaurant', oldThumbnail)
        }
        res.status(200).json({ success: true, message: "Dish updated successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong', error });
    }
}));
adminDishesRouting.get('/read-dish/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const dish = yield prisma_1.default.dishes.findUnique({
            where: { id: +id },
            include: {
                categories: {
                    include: {
                        taxonomy: true
                    }
                }
            }
        });
        if (!dish)
            res.status(404).json({ success: false, message: "Dish not found" });
        res.status(200).json({ success: true, dish });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Something went wrong', error });
    }
}));
adminDishesRouting.delete("/delete-dish/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const thumbnail = req.query.thumbnail;
        yield prisma_1.default.$transaction([
            prisma_1.default.dishesTaxonomy.deleteMany({
                where: { dishId: +id }
            }),
            prisma_1.default.dishes.delete({
                where: { id: +id }
            })
        ]);
        // await deleteFile('restaurant', thumbnail)
        res.status(200).json({ success: true, message: "Dish deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong', error });
    }
}));
adminDishesRouting.get('/all-dishes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, column = 'createdAt', sortOrder = 'desc', page = 1, limit = 15 } = req.query;
        const conditions = {};
        if (search) {
            conditions.title = {
                contains: search,
                mode: "insensitive"
            };
        }
        const query = {};
        if (column && sortOrder) {
            query.orderBy = { [column]: sortOrder };
        }
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
        res.status(500).json({ success: false, message: 'Error', error });
    }
}));
adminDishesRouting.post('/thumbnail-upload', (0, middleware_1.adminAuthentication)(), fileUpload_1.dishesUpload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        res.status(200).json({ success: true, message: 'Successfully uploaded', file });
    }
    catch (error) {
        res.status(500).json({ success: false });
    }
}));
exports.default = adminDishesRouting;
