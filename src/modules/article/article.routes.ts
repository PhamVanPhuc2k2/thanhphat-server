import Router from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { upload } from "../../configs/multer";
import { asyncHandler } from "../../utils/asyncHandler";
import { articleControllers } from "./article.controllers";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  CreateArticleSchema,
  DeleteArticleSchema,
  GetDetailSchema,
  GetListArticleSchema,
  UpdateArticleSchema,
} from "./article.validates";

const router = Router();

router.post(
  "/admin/upload",
  authMiddleware,
  upload("image").single("file"),
  asyncHandler(articleControllers.upload),
);

router.post(
  "/admin/create",
  authMiddleware,
  validateRequest(CreateArticleSchema),
  asyncHandler(articleControllers.create),
);

router.put(
  "/admin/update/:id",
  authMiddleware,
  validateRequest(UpdateArticleSchema),
  asyncHandler(articleControllers.update),
);

router.delete(
  "/admin/delete/:id",
  validateRequest(DeleteArticleSchema),
  asyncHandler(articleControllers.delete),
);

router.get(
  "/list",
  validateRequest(GetListArticleSchema),
  asyncHandler(articleControllers.list),
);

router.get(
  "/:id",
  validateRequest(GetDetailSchema),
  asyncHandler(articleControllers.detail),
);

export default router;
