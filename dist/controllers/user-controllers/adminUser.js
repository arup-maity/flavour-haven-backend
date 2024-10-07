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
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("@/config/prisma"));
const middleware_1 = require("@/middleware");
const adminUserRouting = (0, express_1.Router)();
adminUserRouting.post('/create-user', (0, middleware_1.adminAuthentication)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const findUser = yield prisma_1.default.users.findUnique({
            where: { email: body.email }
        });
        if (findUser)
            res.status(409).send({ success: false, message: "User already exists" });
        const hashPassword = bcrypt_1.default.hashSync(body.password, 16);
        const newUser = yield prisma_1.default.users.create({
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                role: body.role,
                userAuth: {
                    create: {
                        method: "password",
                        password: hashPassword
                    }
                }
            }
        });
        if (!newUser)
            res.status(409).json({ success: false, message: "Not create user" });
        res.status(200).send({ success: true, message: `Successfully create user` });
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
exports.default = adminUserRouting;
