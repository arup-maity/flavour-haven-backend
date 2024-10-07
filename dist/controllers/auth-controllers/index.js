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
const utils_1 = require("@/utils");
const adminUserValidation_1 = require("@/validation/adminUserValidation");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authRouting = (0, express_1.Router)();
authRouting.get('/verify-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie_token = req.cookies.token;
        function getToken() {
            const authorization = req.headers['authorization'];
            if (!authorization || !authorization.startsWith('Bearer ')) {
                return res.status(409).send({ login: false, message: 'token not found' });
            }
            else {
                return authorization.split(' ')[1];
            }
        }
        const token = cookie_token || getToken();
        if (!token) {
            res.status(409).send({ success: false, message: "No token provided" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if ((decoded === null || decoded === void 0 ? void 0 : decoded.purpose) !== 'login')
            res.status(409).json({ success: false, login: false, message: 'this token not for login purpose' });
        res.status(200).send({ success: true, login: true, decoded });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Failed to authenticate token" });
    }
}));
authRouting.post('/admin-login', (0, utils_1.validateData)(adminUserValidation_1.adminLogin), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = req.body;
        // find username
        const findUser = yield prisma_1.default.users.findUnique({
            where: { email: body.email },
            include: {
                userAuth: true
            }
        });
        if (!findUser)
            res.status(409).send({ success: false, message: "User not found" });
        // check password
        const checkPassword = bcrypt_1.default.compareSync(body === null || body === void 0 ? void 0 : body.password, (_a = findUser === null || findUser === void 0 ? void 0 : findUser.userAuth) === null || _a === void 0 ? void 0 : _a.password);
        if (!checkPassword)
            res.status(409).send({ success: false, message: "Not match username and password" });
        // 
        const payload = {
            id: findUser === null || findUser === void 0 ? void 0 : findUser.id,
            name: (findUser === null || findUser === void 0 ? void 0 : findUser.firstName) ? (findUser === null || findUser === void 0 ? void 0 : findUser.firstName) + " " + (findUser === null || findUser === void 0 ? void 0 : findUser.lastName) : '',
            role: findUser === null || findUser === void 0 ? void 0 : findUser.role,
            accessPurpose: 'admin',
            purpose: 'login',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6,
        };
        // generate the token
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET);
        res.cookie('token', token, {
            domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
            path: '/',
            secure: true,
            httpOnly: false,
            maxAge: 30 * 24 * 60 * 60,
        });
        //  return response
        res.status(200).send({ success: true, message: 'Login successfull' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error });
    }
}));
exports.default = authRouting;
