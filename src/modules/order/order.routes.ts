import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrderSchema,
  listOrderSchema,
  trackOrderSchema,
} from "./order.validates";
import { orderController } from "./order.controllers";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

// ===== Public (Khách đặt hàng, không cần auth) =====
router.post(
  "/create",
  validateRequest(createOrderSchema),
  asyncHandler(orderController.create),
);

// ===== Public - Tra cứu đơn hàng =====
router.get(
  "/track",
  validateRequest(trackOrderSchema),
  asyncHandler(orderController.track),
);

// ===== Admin (cần authMiddleware) =====
router.get(
  "/",
  authMiddleware,
  validateRequest(listOrderSchema),
  asyncHandler(orderController.list),
);

router.get(
  "/:id",
  authMiddleware,
  validateRequest(getOrderSchema),
  asyncHandler(orderController.detail),
);

router.patch(
  "/:id/status",
  authMiddleware,
  validateRequest(updateOrderStatusSchema),
  asyncHandler(orderController.updateStatus),
);

router.delete(
  "/:id",
  authMiddleware,
  validateRequest(getOrderSchema),
  asyncHandler(orderController.delete),
);

export default router;
