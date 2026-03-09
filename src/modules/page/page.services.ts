import { handleSlugify } from "../../utils/handleSlugify";
import { CreatePageType, QueryPageType, UpdatePageType } from "./page.types";
import Page from "./page.models";
import { ApiError } from "../../utils/apiError";

export const pageServices = {
  create: async (data: CreatePageType) => {
    const { title } = data;
    const slug = handleSlugify(title);
    const checkTitle = await Page.findOne({ slug });
    if (checkTitle) throw ApiError.Conflict("Tiêu đề trang đã tồn tại");
    const page = await Page.create({ ...data, slug });
    return { page };
  },
  update: async (id: string, data: UpdatePageType) => {
    const page = await Page.findById(id);
    if (!page) throw ApiError.NotFound("Trang không tồn tại");
    const newData: any = { ...data };
    if (data.title) {
      const slug = handleSlugify(data.title);
      const checkTitle = await Page.findOne({ slug, _id: { $ne: id } });
      if (checkTitle) throw ApiError.Conflict("Tiêu đề trang đã tồn tại");
      newData.slug = slug;
    }
    const updated = await Page.findByIdAndUpdate(id, newData, { new: true });
    return { page: updated };
  },
  delete: async (id: string) => {
    const page = await Page.findByIdAndDelete(id);
    if (!page) throw ApiError.NotFound("Trang không tồn tại");
    return id;
  },
  list: async (query: QueryPageType) => {
    const { page = 1, limit = 10, search } = query;
    const filters: any = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filters.title = { $regex: escaped, $options: "i" };
    }
    const skip = (page - 1) * limit;
    const pages = await Page.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    const total = await Page.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);
    return {
      pages,
      pagination: { page, limit, total, totalPages },
    };
  },
  detail: async (id: string) => {
    const page = await Page.findById(id);
    if (!page) throw ApiError.NotFound("Trang không tồn tại");
    return { page };
  },
};
