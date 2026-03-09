import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { dashboardController } from "./dashboard.controllers";

const router = Router();

router.get("/stats", authMiddleware, asyncHandler(dashboardController.stats));

export default router;
