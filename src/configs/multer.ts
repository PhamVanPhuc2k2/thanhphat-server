import multer from "multer";

type Upload = "image" | "video";

export const upload = (type: Upload) => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      if (type === "image" && !file.mimetype.startsWith("image/")) {
        return cb(new Error("Chỉ cho phép upload ảnh"));
      }
      if (type === "video" && !file.mimetype.startsWith("video/")) {
        return cb(new Error("Chỉ cho phép upload video"));
      }
      cb(null, true);
    },
  });
};
