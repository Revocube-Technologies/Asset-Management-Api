import multer, { Options } from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "root/src/utils/error";
import { Request } from "express";

const maxSize = 10 * 1024 * 1024;

const assetsDir = path.join(__dirname, "../../uploads/assets/");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, assetsDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: any
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError(400, "File must be a JPG, JPEG, PNG, or WEBP")
    );
  }
  cb(null, true);
};


export const uploadAssetImage = (options: Options = {}) =>
  multer({
    storage,
    limits: { fileSize: maxSize },
    ...options,
  });

export default uploadAssetImage;
