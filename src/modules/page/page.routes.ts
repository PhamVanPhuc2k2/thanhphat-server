import Router from "express";
import { upload } from "../../configs/multer";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { pageControllers } from "./page.controllers";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  CreatePageSchema,
  UpdatePageSchema,
  DeletePageSchema,
  GetListPageSchema,
  GetDetailPageSchema,
} from "./page.validate";

const router = Router();

router.post(
  "/admin/upload",
  authMiddleware,
  upload("image").single("file"),
  asyncHandler(pageControllers.upload),
);

router.post(
  "/admin/create",
  authMiddleware,
  validateRequest(CreatePageSchema),
  asyncHandler(pageControllers.create),
);

router.put(
  "/admin/update/:id",
  authMiddleware,
  validateRequest(UpdatePageSchema),
  asyncHandler(pageControllers.update),
);

router.delete(
  "/admin/delete/:id",
  authMiddleware,
  validateRequest(DeletePageSchema),
  asyncHandler(pageControllers.delete),
);

router.get(
  "/list",
  validateRequest(GetListPageSchema),
  asyncHandler(pageControllers.list),
);

// Public: lấy trang tĩnh theo slug (cho client)
router.get(
  "/slug/:slug",
  asyncHandler(pageControllers.detailBySlug),
);

router.get(
  "/:id",
  validateRequest(GetDetailPageSchema),
  asyncHandler(pageControllers.detail),
);

export default router;
