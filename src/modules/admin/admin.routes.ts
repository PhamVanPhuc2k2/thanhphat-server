import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createAdminSchema,
  deleteAdminSchema,
  getAdminSchema,
  listAdminSchema,
  loginAdminSchema,
  updateAdminSchema,
  changePasswordSchema,
  updateProfileSchema,
  toggleStatusSchema,
  forceLogoutSchema,
} from "./admin.validates";
import { adminController } from "./admin.controllers";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { requireRole } from "../../middlewares/requireRole";
import { loginLimiter } from "../../configs/rateLimiter";

const router = Router();

// ===== Auth Routes =====
router.post(
  "/login",
  loginLimiter,
  validateRequest(loginAdminSchema),
  asyncHandler(adminController.login),
);

router.post("/logout", authMiddleware, asyncHandler(adminController.logout));

router.post("/refresh-token", asyncHandler(adminController.refresh));

// ===== Self Routes =====
router.get("/me", authMiddleware, asyncHandler(adminController.me));

router.put(
  "/change-password",
  authMiddleware,
  validateRequest(changePasswordSchema),
  asyncHandler(adminController.changePassword),
);

router.put(
  "/profile",
  authMiddleware,
  validateRequest(updateProfileSchema),
  asyncHandler(adminController.updateProfile),
);

// ===== Super Admin Routes =====
router.post(
  "/create",
  authMiddleware,
  requireRole("super-admin"),
  validateRequest(createAdminSchema),
  asyncHandler(adminController.create),
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("super-admin"),
  validateRequest(updateAdminSchema),
  asyncHandler(adminController.update),
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("super-admin"),
  validateRequest(deleteAdminSchema),
  asyncHandler(adminController.delete),
);

router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("super-admin"),
  validateRequest(toggleStatusSchema),
  asyncHandler(adminController.toggleStatus),
);

router.post(
  "/:id/force-logout",
  authMiddleware,
  requireRole("super-admin"),
  validateRequest(forceLogoutSchema),
  asyncHandler(adminController.forceLogout),
);

// ===== Admin List/Detail Routes =====
router.get(
  "/",
  authMiddleware,
  validateRequest(listAdminSchema),
  asyncHandler(adminController.list),
);

router.get(
  "/:id",
  authMiddleware,
  validateRequest(getAdminSchema),
  asyncHandler(adminController.detail),
);

export default router;
