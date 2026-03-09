import { Request, Response } from "express";
import { categoryService } from "./category.services";
import { ApiError } from "../../utils/apiError";
import { uploadCloudinary } from "../../utils/uploadCloudinary";

export const categoryController = {
  create: async (req: Request, res: Response) => {
    const data = req.body;
    const category = await categoryService.create(data);
    return res.status(201).json(category);
  },
  uploadImageCloudinary: async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.BadRequest("Chưa có file upload");
    const image = await uploadCloudinary(file.buffer, "image", "category");
    return res.status(200).json({ image });
  },
  update: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const category = await categoryService.update(id, data);
    return res.status(200).json(category);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const deletedCategory = await categoryService.delete(id);
    return res.status(200).json(deletedCategory);
  },
  list: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const list = await categoryService.list(query);
    return res.status(200).json(list);
  },
  all: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const allCategory = await categoryService.all(query);
    return res.status(200).json(allCategory);
  },
  menu: async (req: Request, res: Response) => {
    const menu = await categoryService.menu();
    return res.status(200).json(menu);
  },
  detail: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const category = await categoryService.detail(id);
    return res.status(200).json(category);
  },
  select: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const categories = await categoryService.select(query);
    return res.status(200).json(categories);
  },
};
