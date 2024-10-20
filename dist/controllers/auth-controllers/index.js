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
exports.cookieParams = cookieParams;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const utils_1 = require("../../utils");
const adminUserValidation_1 = require("../../validation/adminUserValidation");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authRouting = (0, express_1.Router)();
function cookieParams() {
    return {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
        domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
    };
}
authRouting.get('/verify-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookieToken = req.cookies.token;
        const getToken = () => {
            const authorization = req.headers['authorization'];
            if (authorization && authorization.startsWith('Bearer ')) {
                return authorization.split(' ')[1];
            }
            return null;
        };
        const token = cookieToken || getToken();
        if (!token)
            res.status(401).send({ success: false, message: "No token provided" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if ((decoded === null || decoded === void 0 ? void 0 : decoded.purpose) !== 'login')
            res.status(401).json({ success: false, login: false, message: 'This token is not for login purposes' });
        res.status(200).send({ success: true, login: true, decoded });
    }
    catch (error) {
        // console.error(error)
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
        };
        // generate the token
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
            path: '/',
            secure: true,
            httpOnly: false,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        //  return response
        res.status(200).send({ success: true, message: 'Login successfull' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error });
    }
}));
authRouting.post("/user-register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        // Check if user already exists
        const checkUser = yield prisma_1.default.users.findUnique({
            where: { email: body.email }
        });
        if (checkUser)
            res.status(409).json({ success: false, message: "User already exists" });
        // Hash the password
        const hashPassword = bcrypt_1.default.hashSync(body.password, 10); // Consider using a higher value for production
        // Create the new user
        const newUser = yield prisma_1.default.users.create({
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                role: 'user',
                isActive: true,
                userAuth: {
                    create: {
                        method: "password",
                        password: hashPassword
                    }
                }
            }
        });
        res.status(201).json({ success: true, user: newUser, message: 'Account created successfully' });
    }
    catch (error) {
        console.error(error); // Log error for debugging
        res.status(500).send({ success: false, message: "Internal server error" });
    }
}));
authRouting.post("/user-login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = req.body;
        const findUser = yield prisma_1.default.users.findUnique({
            where: { email: body.email },
            include: {
                userAuth: true
            }
        });
        if (!findUser)
            res.status(409).json({ success: false, message: "User not found" });
        const checkPassword = bcrypt_1.default.compareSync(body === null || body === void 0 ? void 0 : body.password, (_a = findUser === null || findUser === void 0 ? void 0 : findUser.userAuth) === null || _a === void 0 ? void 0 : _a.password);
        if (!checkPassword)
            res.status(409).json({ success: false, message: "Not match username and password" });
        const payload = {
            id: findUser === null || findUser === void 0 ? void 0 : findUser.id,
            name: (findUser === null || findUser === void 0 ? void 0 : findUser.firstName) ? (findUser === null || findUser === void 0 ? void 0 : findUser.firstName) + " " + (findUser === null || findUser === void 0 ? void 0 : findUser.lastName) : '',
            role: findUser === null || findUser === void 0 ? void 0 : findUser.role,
            accessPurpose: 'user',
            purpose: 'login',
        };
        // generate the token
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            domain: process.env.ENVIRONMENT === 'production' ? '.arupmaity.in' : 'localhost',
            path: '/',
            secure: true,
            httpOnly: false,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ success: true, message: 'Login successful' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error });
    }
}));
exports.default = authRouting;
