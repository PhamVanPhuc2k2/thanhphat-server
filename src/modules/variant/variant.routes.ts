import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  CreateVariantSchema,
  DeleteVariantSchema,
  ListVariantSchema,
  UpdateVariantSchema,
} from "./variant.validates";
import { variantControllers } from "./variant.controllers";
import { asyncHandler } from "../../utils/asyncHandler";
import { upload } from "../../configs/multer";

const router = Router();

router.post(
  "/admin/upload",
  authMiddleware,
  upload("image").array("file"),
  asyncHandler(variantControllers.upload),
);

router.post(
  "/admin/create",
  authMiddleware,
  validateRequest(CreateVariantSchema),
  asyncHandler(variantControllers.create),
);

router.put(
  "/admin/update/:id",
  authMiddleware,
  validateRequest(UpdateVariantSchema),
  asyncHandler(variantControllers.update),
);

router.delete(
  "/admin/delete/:id",
  authMiddleware,
  validateRequest(DeleteVariantSchema),
  asyncHandler(variantControllers.delete),
);

router.get(
  "/admin/list",
  authMiddleware,
  validateRequest(ListVariantSchema),
  asyncHandler(variantControllers.list),
);

export default router;
