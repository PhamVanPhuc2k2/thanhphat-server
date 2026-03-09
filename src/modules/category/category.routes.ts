import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createCategorySchema,
  deleteCategorySchema,
  getAllSchema,
  getDetailSchema,
  getListSchema,
  SelectCategorySchema,
  updateCategorySchema,
} from "./category.validates";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { categoryController } from "./category.controllers";
import { upload } from "../../configs/multer";

const router = Router();

router.post(
  "/admin/upload",
  authMiddleware,
  upload("image").single("file"),
  asyncHandler(categoryController.uploadImageCloudinary),
);

router.post(
  "/admin/create",
  authMiddleware,
  validateRequest(createCategorySchema),
  asyncHandler(categoryController.create),
);

router.put(
  "/admin/update/:id",
  authMiddleware,
  validateRequest(updateCategorySchema),
  asyncHandler(categoryController.update),
);

router.delete(
  "/admin/delete/:id",
  authMiddleware,
  validateRequest(deleteCategorySchema),
  asyncHandler(categoryController.delete),
);

router.get(
  "/admin/list",
  authMiddleware,
  validateRequest(getListSchema),
  asyncHandler(categoryController.list),
);

router.get(
  "/all",
  validateRequest(getAllSchema),
  asyncHandler(categoryController.all),
);

router.get("/menu", asyncHandler(categoryController.menu));

router.get(
  "/admin/select-category",
  authMiddleware,
  validateRequest(SelectCategorySchema),
  asyncHandler(categoryController.select),
);

router.get(
  "/:id",
  validateRequest(getDetailSchema),
  asyncHandler(categoryController.detail),
);

export default router;
