import mongoose from "mongoose";
import { GetProductsTypes } from "../../modules/product/product.types";
import { escapeRegex } from "../escapeRegex";

export const GetProductsQuery = (query: GetProductsTypes) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    isActive,
    brandId,
    categoryId,
  } = query;
  const filter: any = {};
  const options: any = {};
  if (search) {
    const safeSearch = escapeRegex(search.trim());
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { slug: { $regex: safeSearch, $options: "i" } },
    ];
  }
  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }
  if (brandId) filter.brandId = new mongoose.Types.ObjectId(brandId);
  if (categoryId) filter.categoryId = new mongoose.Types.ObjectId(categoryId);
  options.sort = { createdAt: -1 };
  options.page = page;
  options.limit = limit;
  options.skip = (page - 1) * limit;
  return { filter, options };
};
