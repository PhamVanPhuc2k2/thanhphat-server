import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { apiLimiter } from "./configs/rateLimiter";
import { corsMiddleware } from "./configs/cors";
import compression from "compression";
import adminRoutes from "./modules/admin/admin.routes";
import categoryRoutes from "./modules/category/category.routes";
import brandRoutes from "./modules/brand/brand.routes";
import { errorHandler } from "./utils/errorHandler";
import { startCleanupCloudinaryCron } from "./jobs/startCleanupCloudinaryCron";
import productRoutes from "./modules/product/product.routes";
import variantRoutes from "./modules/variant/variant.routes";
import bannerRoutes from "./modules/banner/banner.routes";
import articleRoutes from "./modules/article/article.routes";
import pageRoutes from "./modules/page/page.routes";
import orderRoutes from "./modules/order/order.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();

// ===== Global Middleware (PHẢI đặt TRƯỚC routes) =====
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(corsMiddleware);

// ===== Health Check =====
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== API Rate Limiter =====

app.use("/api", apiLimiter);

// ===== Routes =====
app.use("/api/admin", adminRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/product", productRoutes);
app.use("/api/variant", variantRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/article", articleRoutes);
app.use("/api/page", pageRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ===== Error Handler (PHẢI đặt SAU routes) =====
app.use(errorHandler);

startCleanupCloudinaryCron();

export default app;
