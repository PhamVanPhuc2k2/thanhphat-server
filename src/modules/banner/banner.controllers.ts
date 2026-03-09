import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { uploadCloudinary } from "../../utils/uploadCloudinary";
import { bannerServices } from "./banner.services";

export const bannerControllers = {
  upload: async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.BadRequest("Chưa có file upload");
    const image = await uploadCloudinary(file.buffer, "image", "banner");
    return res.status(200).json({ image });
  },
  create: async (req: Request, res: Response) => {
    const data = req.body;
    const banner = await bannerServices.create(data);
    return res.status(201).json(banner);
  },
  list: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const banners = await bannerServices.list(query);
    return res.status(200).json(banners);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const deletedId = await bannerServices.delete(id);
    return res.status(200).json(deletedId);
  },
  detail: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const banner = await bannerServices.detail(id);
    return res.status(200).json(banner);
  },
  update: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const banner = await bannerServices.update(id, data);
    return res.status(200).json(banner);
  },
};
