import { handleSlugify } from "../../utils/handleSlugify";
import {
  AllBrandQuery,
  CreateBrandTypes,
  ListBrandQuery,
  UpdateBrandTypes,
} from "./brand.types";
import Brand from "./brand.models";
import { ApiError } from "../../utils/apiError";
import { redis } from "../../configs/redis";
import { listBrandQuery } from "../../utils/query/listBrand.query";
import Product from "../product/product.models";
import { allBrandQuery } from "../../utils/query/allBrand.query";

export const brandServices = {
  create: async (data: CreateBrandTypes) => {
    const slug = handleSlugify(data.name);

    const existing = await Brand.findOne({ slug });
    if (existing) throw ApiError.Conflict("Thương hiệu đã tồn tại");

    const brand = await Brand.create({
      ...data,
      slug,
    });

    return { brand };
  },

  update: async (id: string, data: UpdateBrandTypes) => {
    const existed = await Brand.findById(id);
    if (!existed) throw ApiError.NotFound("Thương hiệu sản phẩm không tồn tại");

    if (data.name) {
      const slug = handleSlugify(data.name);
      const checkSlug = await Brand.findOne({ slug });

      if (checkSlug && !checkSlug._id.equals(existed._id))
        throw ApiError.Conflict("Tên thương hiệu đã tồn tại");

      data.slug = slug;
    }

    existed.set(data);

    await existed.save();
    await redis.del("brand:all");

    return { updatedBrand: existed };
  },
  delete: async (id: string) => {
    const brand = await Brand.findById(id);
    if (!brand) throw ApiError.NotFound("Thương hiệu sản phẩm không tồn tại");
    const checkProduct = await Product.findOne({ brandId: id });
    if (checkProduct)
      throw ApiError.Conflict("Không thể xóa thương hiệu vì có sản phẩm");
    await Brand.findByIdAndDelete(id);
    return id;
  },
  list: async (query: ListBrandQuery) => {
    const parserQuery = listBrandQuery(query);
    const { filter, options } = parserQuery;
    const brands = await Brand.find(filter)
      .sort(options.sort)
      .limit(options.limit)
      .skip(options.skip);
    const total = await Brand.countDocuments(filter);
    return {
      brands,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  },
  detail: async (id: string) => {
    const brand = await Brand.findById(id);
    if (!brand) throw ApiError.NotFound("Thương hiệu sản phẩm không tồn tại");
    return { brand };
  },
  all: async (query: AllBrandQuery) => {
    const parserQuery = allBrandQuery(query);
    const { filter, options } = parserQuery;
    const brands = await Brand.find(filter).sort(options.sort);
    return { brands };
  },
  publicList: async () => {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean();
    return { brands };
  },
};
