import multer from "multer";
import fs from "fs";

export const multer_local = ({
  customPath = "General",
  customType = [],
} = {}) => {
  const fullPath = `uploads/${customPath}`;

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
  const storage = multer.diskStorage({});

  function fileFilter(req, file, cb) {
    if (!customType.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  }
  const upload = multer({ storage, fileFilter });
  return upload;
};
