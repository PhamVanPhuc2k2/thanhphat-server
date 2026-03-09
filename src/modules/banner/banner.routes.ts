import Router from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { upload } from "../../configs/multer";
import { asyncHandler } from "../../utils/asyncHandler";
import { bannerControllers } from "./banner.controllers";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  CreateBannerSchema,
  DeleteBannerSchema,
  GetBannerSchema,
  GetBannersSchema,
  UpdateBannerSchema,
} from "./banner.validates";

const router = Router();

router.post(
  "/admin/upload",
  authMiddleware,
  upload("image").single("file"),
  asyncHandler(bannerControllers.upload),
);

router.post(
  "/admin/create",
  authMiddleware,
  validateRequest(CreateBannerSchema),
  asyncHandler(bannerControllers.create),
);

router.put(
  "/admin/update/:id",
  authMiddleware,
  validateRequest(UpdateBannerSchema),
  asyncHandler(bannerControllers.update),
);

router.get(
  "/admin",
  authMiddleware,
  validateRequest(GetBannersSchema),
  asyncHandler(bannerControllers.list),
);

router.delete(
  "/admin/delete/:id",
  authMiddleware,
  validateRequest(DeleteBannerSchema),
  asyncHandler(bannerControllers.delete),
);

router.get(
  "/admin/:id",
  authMiddleware,
  validateRequest(GetBannerSchema),
  asyncHandler(bannerControllers.detail),
);

export default router;
