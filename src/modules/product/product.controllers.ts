import { Request, Response } from "express";
import { productServices } from "./product.services";
import { ApiError } from "../../utils/apiError";
import { uploadCloudinary } from "../../utils/uploadCloudinary";

export const productControllers = {
  uploadImageCloudinary: async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files) throw ApiError.BadRequest("Chưa có file upload");
    const uploadPromises = files.map((file) =>
      uploadCloudinary(file.buffer, "image", "product"),
    );
    const images = await Promise.all(uploadPromises);
    return res.status(200).json({ images });
  },

  uploadOgImageCloudinary: async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.BadRequest("Chưa có file upload");
    const image = await uploadCloudinary(file.buffer, "image", "product");
    return res.status(200).json({ image });
  },

  uploadVideoCloudinary: async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.BadRequest("Chưa có file upload");
    const video = await uploadCloudinary(file.buffer, "video", "product");
    return res.status(200).json({ video });
  },
  create: async (req: Request, res: Response) => {
    const data = req.body;
    const product = await productServices.create(data);
    return res.status(201).json(product);
  },
  update: async (req: Request, res: Response) => {
    const data = req.body;
    const { id } = req.params as { id: string };
    const product = await productServices.update(id, data);
    return res.status(200).json(product);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const productId = await productServices.delete(id);
    return res.status(200).json(productId);
  },
  list: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const products = await productServices.list(query);
    return res.status(200).json(products);
  },
  detail: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const product = await productServices.detail(id);
    return res.status(200).json(product);
  },
};
