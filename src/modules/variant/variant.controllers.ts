import { Request, Response } from "express";
import { variantServices } from "./variant.services";
import { ApiError } from "../../utils/apiError";
import { uploadCloudinary } from "../../utils/uploadCloudinary";

export const variantControllers = {
  upload: async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files) throw ApiError.BadRequest("Chưa có file upload");
    const uploadPromises = files.map((file) =>
      uploadCloudinary(file.buffer, "image", "variant"),
    );
    const images = await Promise.all(uploadPromises);
    return res.status(200).json({ images });
  },
  create: async (req: Request, res: Response) => {
    const data = req.body;
    const variant = await variantServices.create(data);
    return res.status(200).json(variant);
  },
  update: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const variant = await variantServices.update(id, data);
    return res.status(200).json(variant);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const variantId = await variantServices.delete(id);
    return res.status(200).json(variantId);
  },
  list: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const variants = await variantServices.list(query);
    return res.status(200).json(variants);
  },
};
