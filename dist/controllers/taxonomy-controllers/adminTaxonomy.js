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
const prisma_1 = __importDefault(require("@/config/prisma"));
const middleware_1 = require("@/middleware");
const fileUpload_1 = require("@/config/fileUpload");
const adminTaxonomyRouting = (0, express_1.Router)();
adminTaxonomyRouting.use((0, middleware_1.adminAuthentication)());
adminTaxonomyRouting.post('/create-taxonomy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const checkSlug = yield prisma_1.default.taxonomy.findUnique({
            where: { slug: body.slug }
        });
        if (checkSlug)
            return res.status(409).json({ success: false, message: "Slug already exists" });
        const newTaxonomy = yield prisma_1.default.taxonomy.create({
            data: body
        });
        if (!newTaxonomy)
            return res.status(409).json({ success: false, message: "Unsccessfull" });
        return res.status(200).json({ success: true, message: 'Created successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to create taxonomy' });
    }
}));
adminTaxonomyRouting.put('/update-taxonomy/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const _a = req.body, { oldThumbnail } = _a, rest = __rest(_a, ["oldThumbnail"]);
        const checkSlug = yield prisma_1.default.taxonomy.findUnique({
            where: {
                slug: rest.slug,
                NOT: { id: +id }
            }
        });
        if (checkSlug)
            return res.status(409).json({ success: false, message: "Slug already exists" });
        const updatedTaxonomy = yield prisma_1.default.taxonomy.update({
            where: { id: +id },
            data: rest
        });
        if (!updatedTaxonomy)
            return res.status(409).json({ success: false, message: "Not updated" });
        if (oldThumbnail !== (rest === null || rest === void 0 ? void 0 : rest.thumbnail)) {
            // await deleteFile('restaurant', oldThumbnail)
        }
        return res.status(200).json({ success: true, message: 'Updated successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to update taxonomy' });
    }
}));
adminTaxonomyRouting.get('/read-taxonomy/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const taxonomy = yield prisma_1.default.taxonomy.findUnique({
            where: { id: +id }
        });
        if (!taxonomy)
            return res.status(404).json({ success: false, message: 'Taxonomy not found' });
        return res.status(200).json({ success: true, taxonomy });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Something wrong', error });
    }
}));
adminTaxonomyRouting.delete("/delete-taxonomy/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const thumbnail = req.query.thumbnail || '';
        const deletedTaxonomy = yield prisma_1.default.taxonomy.delete({
            where: { id: +id }
        });
        if (!deletedTaxonomy)
            return res.status(409).send({ success: false, message: "Delete not successfully" });
        const fileList = [`${thumbnail}`];
        // await deleteFilesFromStore(fileList)
        return res.status(200).send({ success: true, message: 'Deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: 'Failed to delete taxonomy' });
    }
}));
adminTaxonomyRouting.get('/all-taxonomies', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, column = 'createdAt', sortOrder = 'desc', page = 1, limit = 15 } = req.query;
        const conditions = {};
        if (search) {
            conditions.cityName = {
                contains: search,
                mode: "insensitive"
            };
        }
        const query = {};
        if (column && sortOrder) {
            query.orderBy = { [column]: sortOrder };
        }
        const taxonomies = yield prisma_1.default.taxonomy.findMany(Object.assign({ where: conditions, take: +limit, skip: (+page - 1) * +limit }, query));
        const count = yield prisma_1.default.taxonomy.count();
        res.status(200).send({ success: true, taxonomies, total: count });
    }
    catch (error) {
        res.status(500).send({ success: false, error });
    }
}));
adminTaxonomyRouting.post('/thumbnail-upload', (0, middleware_1.adminAuthentication)(), fileUpload_1.taxonomyUpload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        res.status(200).json({ success: true, message: 'Successfully uploaded', file });
    }
    catch (error) {
        res.status(500).json({ success: false });
    }
}));
exports.default = adminTaxonomyRouting;
