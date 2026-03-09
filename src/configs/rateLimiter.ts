import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // Tối đa 10 lần thử trong 15 phút
  message: {
    message: "Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100, // Tối đa 100 request/phút
  message: {
    message: "Quá nhiều request, vui lòng thử lại sau",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
