import {
  CreateBannerType,
  QueryBannerType,
  UpdateBannerType,
} from "./banner.types";
import Category from "../category/category.models";
import Banner from "./banner.models";
import { ApiError } from "../../utils/apiError";
import { listBannerQuery } from "../../utils/query/listBanner.query";
import cloudinary from "../../configs/cloudinary";
export const bannerServices = {
  create: async (data: CreateBannerType) => {
    const { categoryId } = data;
    if (categoryId) {
      const checkCategory = await Category.findById(categoryId).select(
        "-createdAt -updatedAt -__v",
      );
      if (!checkCategory)
        throw ApiError.NotFound("Danh mục sản phẩm không tồn tại");
    }
    const banner = await Banner.create(data);
    return { banner };
  },
  list: async (query: QueryBannerType) => {
    const parserQuery = listBannerQuery(query);
    const { filter, options } = parserQuery;
    const banners = await Banner.find(filter)
      .populate("categoryId", "name")
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit);
    const total = await Banner.countDocuments(filter);
    return {
      banners,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  },
  delete: async (id: string) => {
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) throw ApiError.NotFound("Banner không tồn tại");
    if (banner.image?.public_id) {
      await cloudinary.uploader.destroy(banner.image.public_id);
    }
    return id;
  },
  detail: async (id: string) => {
    const banner = await Banner.findById(id);
    if (!banner) throw ApiError.NotFound("Banner không tồn tại");
    return { banner };
  },
  update: async (id: string, data: UpdateBannerType) => {
    const banner = await Banner.findById(id);
    if (!banner) throw ApiError.NotFound("Banner không tồn tại");
    const updatedBanner = await Banner.findByIdAndUpdate(id, data, {
      new: true,
    });
    return {
      banner: updatedBanner,
    };
  },
};
