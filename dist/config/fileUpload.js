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
exports.dishesUpload = exports.taxonomyUpload = void 0;
exports.deleteFilesFromStore = deleteFilesFromStore;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: '005d5d9f1de0b510000000001',
        secretAccessKey: 'K005RK2iG+mDeAd1+Vb2dWG7CCQAVjQ'
    },
    endpoint: 'https://s3.us-east-005.backblazeb2.com',
    region: 'us-east-005',
});
function sanitizeFileImage(file, cb) {
    // Define the allowed extension
    const fileExts = ['.png', '.jpg', '.jpeg', '.gif'];
    // Check allowed extensions
    const isAllowedExt = fileExts.includes(path_1.default.extname(file.originalname.toLowerCase()));
    // Mime type must be an image
    const isAllowedMimeType = file.mimetype.startsWith('image/');
    if (isAllowedExt && isAllowedMimeType) {
        return cb(null, true); // no errors
    }
    // pass error msg to callback, which can be displayed in frontend
    cb('Error: File type not allowed!');
}
// Taxonomy File Uploader
const taxonomyStorage = (0, multer_s3_1.default)({
    s3: s3, // s3 instance
    bucket: 'coolify-database-backup', // change it as per your project requirement
    acl: 'public-read', // storage access type
    key: (req, file, cb) => {
        const folder = 'restaurent/taxonomy';
        const originalname = file.originalname;
        const fullPath = `${folder}/${originalname}`;
        cb(null, fullPath);
    },
});
exports.taxonomyUpload = (0, multer_1.default)({
    storage: taxonomyStorage,
    fileFilter: (req, file, cb) => {
        sanitizeFileImage(file, cb);
    },
    limits: {
        fileSize: 1000000, // max file size 1MB = 1000000 bytes
    },
});
// Taxonomy File Uploader
const dishesStorage = (0, multer_s3_1.default)({
    s3: s3, // s3 instance
    bucket: 'coolify-database-backup', // change it as per your project requirement
    acl: 'public-read', // storage access type
    key: (req, file, cb) => {
        const folder = 'restaurent/dishes';
        const originalname = file.originalname;
        const fullPath = `${folder}/${originalname}`;
        cb(null, fullPath);
    },
});
exports.dishesUpload = (0, multer_1.default)({
    storage: dishesStorage,
    fileFilter: (req, file, cb) => {
        sanitizeFileImage(file, cb);
    },
    limits: {
        fileSize: 1000000, // max file size 1MB = 1000000 bytes
    },
});
function deleteFilesFromStore(files) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if the array is empty
        if (files.length === 0) {
            console.log('No files to delete');
            return true;
        }
        // Helper function to format the S3 object keys
        const getKeys = (files) => {
            return files.map(file => ({ Key: file }));
        };
        // Define parameters for DeleteObjectsCommand
        const params = {
            Bucket: 'coolify-database-backup', // Change it as per your project requirement
            Delete: {
                Objects: getKeys(files), // Call helper function to get object keys
            },
        };
        try {
            const command = new client_s3_1.DeleteObjectsCommand(params);
            const data = yield s3.send(command);
            console.log('Success. The deleted objects are: ', data.Deleted);
            return { success: true, delete: data.Deleted };
        }
        catch (err) {
            console.log('Error', err);
            return false;
        }
    });
}
