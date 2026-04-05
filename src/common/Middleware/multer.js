import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os"; // ضفنا المكتبة دي عشان نجيب مسار الـ tmp الخاص بـ Vercel

export const multer_local = ({
  customPath = "General",
  customType = [],
} = {}) => {
  // التعديل هنا: هنستخدم الـ tmp directory بتاع السيرفر
  const tmpDir = os.tmpdir();
  const fullPath = path.join(tmpDir, `uploads/${customPath}`);

  // الـ Vercel هيسمح بإنشاء الفولدر هنا عادي جداً
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  function fileFilter(req, file, cb) {
    if (!customType.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};

export const multer_cloudinary = (customType = []) => {
  // التعديل هنا: برضه هنحفظ الملف مؤقتاً في الـ tmp قبل ما يترفع لـ Cloudinary
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    }
  });

  function fileFilter(req, file, cb) {
    if (!customType.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  }
  
  const upload = multer({ storage, fileFilter });
  return upload;
};