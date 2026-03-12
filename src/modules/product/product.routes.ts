import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  CreateProductSchema,
  DeleteProductSchema,
  GetProductSchema,
  GetProductsSchema,
  UpdateProductSchema,
} from "./product.validates";
import { productControllers } from "./product.controllers";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { upload } from "../../configs/multer";

const router = Router();

// Public endpoints
router.get("/list", asyncHandler(productControllers.publicList));
router.get("/detail/:slug", asyncHandler(productControllers.publicDetail));

router.post(
  "/admin/upload",
  authMiddleware,
  upload("image").array("file"),
  asyncHandler(productControllers.uploadImageCloudinary),
);

router.post(
  "/admin/upload-video",
  authMiddleware,
  upload("video").single("file"),
  asyncHandler(productControllers.uploadVideoCloudinary),
);

router.post(
  "/admin/upload-ogImage",
  authMiddleware,
  upload("image").single("file"),
  asyncHandler(productControllers.uploadOgImageCloudinary),
);

router.post(
  "/admin/create",
  authMiddleware,
  validateRequest(CreateProductSchema),
  asyncHandler(productControllers.create),
);

router.put(
  "/admin/update/:id",
  authMiddleware,
  validateRequest(UpdateProductSchema),
  asyncHandler(productControllers.update),
);

router.delete(
  "/admin/delete/:id",
  authMiddleware,
  validateRequest(DeleteProductSchema),
  asyncHandler(productControllers.delete),
);

router.get(
  "/admin/list",
  authMiddleware,
  validateRequest(GetProductsSchema),
  asyncHandler(productControllers.list),
);

router.get(
  "/admin/:id",
  authMiddleware,
  validateRequest(GetProductSchema),
  asyncHandler(productControllers.detail),
);

export default router;
