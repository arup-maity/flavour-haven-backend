import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import multer from 'multer'
import multerS3 from 'multer-s3'
import path from 'path'

const s3 = new S3Client({
   credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
   },
   endpoint: process.env.S3_END_POINT,
   region: process.env.S3_REGION,
});

function sanitizeFileImage(file: any, cb: any) {
   // Define the allowed extension
   const fileExts = ['.png', '.jpg', '.jpeg', '.gif'];
   // Check allowed extensions
   const isAllowedExt = fileExts.includes(path.extname(file.originalname.toLowerCase()));
   // Mime type must be an image
   const isAllowedMimeType = file.mimetype.startsWith('image/');
   if (isAllowedExt && isAllowedMimeType) {
      return cb(null, true); // no errors
   }
   // pass error msg to callback, which can be displayed in frontend
   cb('Error: File type not allowed!');
}

// Taxonomy File Uploader
const taxonomyStorage = multerS3({
   s3: s3, // s3 instance
   bucket: process.env.S3_BUCKET, // change it as per your project requirement
   acl: 'public-read', // storage access type
   key: (req, file, cb) => {
      const folder = 'restaurent/taxonomy';
      const originalname = file.originalname;
      const fullPath = `${folder}/${originalname}`;
      cb(null, fullPath);
   },
});
export const taxonomyUpload = multer({
   storage: taxonomyStorage,
   fileFilter: (req, file, cb) => {
      sanitizeFileImage(file, cb);
   },
   limits: {
      fileSize: 1000000, // max file size 1MB = 1000000 bytes
   },
});

// Taxonomy File Uploader
const dishesStorage = multerS3({
   s3: s3, // s3 instance
   bucket: process.env.S3_BUCKET, // change it as per your project requirement
   acl: 'public-read', // storage access type
   key: (req, file, cb) => {
      const folder = 'restaurent/dishes';
      const originalname = file.originalname;
      const fullPath = `${folder}/${originalname}`;
      cb(null, fullPath);
   },
});
export const dishesUpload = multer({
   storage: dishesStorage,
   fileFilter: (req, file, cb) => {
      sanitizeFileImage(file, cb);
   },
   limits: {
      fileSize: 8000000, // max file size 1MB = 1000000 bytes
   },
});

export async function deleteFilesFromStore(files: string[]): Promise<{ success: boolean, delete?: any } | boolean> {
   // Check if the array is empty
   if (files.length === 0) {
      console.log('No files to delete');
      return true;
   }

   // Helper function to format the S3 object keys
   const getKeys = (files: string[]) => {
      return files.map(file => ({ Key: file }));
   };

   // Define parameters for DeleteObjectsCommand
   const params = {
      Bucket: process.env.S3_BUCKET,  // Change it as per your project requirement
      Delete: {
         Objects: getKeys(files),          // Call helper function to get object keys
      },
   };

   try {
      const command = new DeleteObjectsCommand(params);
      const data = await s3.send(command);
      console.log('Success. The deleted objects are: ', data.Deleted);

      return { success: true, delete: data.Deleted };
   } catch (err) {
      console.log('Error', err);
      return false;
   }
}