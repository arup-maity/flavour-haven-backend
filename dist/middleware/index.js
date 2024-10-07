"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthentication = exports.adminAuthentication = void 0;
// admin
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminAuthentication = () => {
    return (req, res, next) => {
        try {
            const token = req.cookies.token;
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if ((decoded === null || decoded === void 0 ? void 0 : decoded.purpose) !== 'login' && decoded.accessPurpose === 'admin')
                res.status(409).json({ success: false, login: false, message: 'this token not for login purpose' });
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};
exports.adminAuthentication = adminAuthentication;
const userAuthentication = () => {
    return (req, res, next) => {
        try {
            const token = req.cookies.token;
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if ((decoded === null || decoded === void 0 ? void 0 : decoded.purpose) !== 'login')
                res.status(409).json({ success: false, login: false, message: 'this token not for login purpose' });
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};
exports.userAuthentication = userAuthentication;
