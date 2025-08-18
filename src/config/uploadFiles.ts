import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request, Response, NextFunction } from "express";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Optional: organize uploads in a folder
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (
      !file.mimetype.startsWith("image/") &&
      file.mimetype !== "application/pdf"
    ) {
      cb(new Error("Only image and PDF files are allowed!"));
      return;
    }
    cb(null, true);
  },
});

const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: "File upload error",
      error: error.message,
    });
  }
  if (error) {
    return res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
  next();
};

export { upload, handleUploadError };
