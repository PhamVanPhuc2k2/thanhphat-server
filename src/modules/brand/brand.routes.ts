import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createBrandSchema,
  deleteBrandSchema,
  GetAllBrandSchema,
  getBrandSchema,
  getBrandsSchema,
  updateBrandSchema,
} from "./brand.validates";
import { brandControllers } from "./brand.controllers";
import { upload } from "../../configs/multer";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

// Public endpoint
router.get("/list", asyncHandler(brandControllers.publicList));

router.post(
  "/admin/upload",
  authMiddleware,
  upload("image").single("file"),
  asyncHandler(brandControllers.uploadImageCloudinary),
);

router.post(
  "/admin/create",
  authMiddleware,
  validateRequest(createBrandSchema),
  asyncHandler(brandControllers.create),
);

router.put(
  "/admin/update/:id",
  authMiddleware,
  validateRequest(updateBrandSchema),
  asyncHandler(brandControllers.update),
);

router.delete(
  "/admin/delete/:id",
  authMiddleware,
  validateRequest(deleteBrandSchema),
  asyncHandler(brandControllers.delete),
);

router.get(
  "/admin/list",
  authMiddleware,
  validateRequest(getBrandsSchema),
  asyncHandler(brandControllers.list),
);

router.get(
  "/admin/all",
  authMiddleware,
  validateRequest(GetAllBrandSchema),
  asyncHandler(brandControllers.all),
);

router.get(
  "/admin/:id",
  authMiddleware,
  validateRequest(getBrandSchema),
  asyncHandler(brandControllers.detail),
);

export default router;
