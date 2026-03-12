import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { uploadCloudinary } from "../../utils/uploadCloudinary";
import { pageServices } from "./page.services";

export const pageControllers = {
  upload: async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.BadRequest("Chưa có file upload");
    const image = await uploadCloudinary(file.buffer, "image", "page");
    return res.status(200).json(image);
  },
  create: async (req: Request, res: Response) => {
    const data = req.body;
    const page = await pageServices.create(data);
    return res.status(201).json(page);
  },
  update: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const page = await pageServices.update(id, data);
    return res.status(200).json(page);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const deletedId = await pageServices.delete(id);
    return res.status(200).json(deletedId);
  },
  list: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const result = await pageServices.list(query);
    return res.status(200).json(result);
  },
  detail: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const page = await pageServices.detail(id);
    return res.status(200).json(page);
  },

  detailBySlug: async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const page = await pageServices.detailBySlug(slug);
    return res.status(200).json(page);
  },
};
