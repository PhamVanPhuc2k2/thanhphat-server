import { Request, Response } from "express";
import { brandServices } from "./brand.services";
import { ApiError } from "../../utils/apiError";
import { uploadCloudinary } from "../../utils/uploadCloudinary";

export const brandControllers = {
  create: async (req: Request, res: Response) => {
    const data = req.body;
    const brand = await brandServices.create(data);
    return res.status(201).json(brand);
  },
  uploadImageCloudinary: async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.BadRequest("Chưa có file upload");
    const logo = await uploadCloudinary(file.buffer, "image", "brand");
    return res.status(200).json({ logo });
  },
  update: async (req: Request, res: Response) => {
    const data = req.body;
    const { id } = req.params as { id: string };
    const updatedBrand = await brandServices.update(id, data);
    return res.status(200).json(updatedBrand);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const deletedId = await brandServices.delete(id);
    return res.status(200).json(deletedId);
  },
  list: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const brands = await brandServices.list(query);
    return res.status(200).json(brands);
  },
  detail: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const brand = await brandServices.detail(id);
    return res.status(200).json(brand);
  },
  all: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const brands = await brandServices.all(query);
    return res.status(200).json(brands);
  },
};
