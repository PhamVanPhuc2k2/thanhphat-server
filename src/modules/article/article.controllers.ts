import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { uploadCloudinary } from "../../utils/uploadCloudinary";
import { articleServices } from "./article.services";

export const articleControllers = {
  upload: async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.BadRequest("Chưa có file upload");
    const image = await uploadCloudinary(file.buffer, "image", "article");
    return res.status(200).json(image);
  },
  create: async (req: Request, res: Response) => {
    const data = req.body;
    const article = await articleServices.create(data);
    return res.status(201).json(article);
  },
  update: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const article = await articleServices.update(id, data);
    return res.status(200).json(article);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const deletedId = await articleServices.delete(id);
    return res.status(200).json(deletedId);
  },
  list: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const articles = await articleServices.list(query);
    return res.status(200).json(articles);
  },
  detail: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const article = await articleServices.detail(id);
    return res.status(200).json(article);
  },
};
