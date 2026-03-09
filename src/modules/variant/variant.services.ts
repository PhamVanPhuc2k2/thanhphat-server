import {
  CreateVariantType,
  ListVariantType,
  UpdateVariantType,
} from "./variant.types";
import Product from "../product/product.models";
import { ApiError } from "../../utils/apiError";
import { handleSlugify } from "../../utils/handleSlugify";
import Variant from "./variant.models";
import { listVariantQuery } from "../../utils/query/listVariant.query";

export const variantServices = {
  create: async (data: CreateVariantType) => {
    const { productId, name, discountPrice, price } = data;
    const checkProduct = await Product.findById(productId);
    if (!checkProduct) throw ApiError.NotFound("Sản phẩm không tồn tại");
    const slug = handleSlugify(name);
    const checkSlug = await Variant.findOne({ slug });
    if (checkSlug) throw ApiError.Conflict("Tên biến thể đã tồn tại");
    data.slug = slug;
    if (discountPrice) {
      if (discountPrice > price)
        throw ApiError.BadRequest(
          "Giá đặc biệt không thể lớn hơn giá niêm yết",
        );
      const percentDiscount = Math.ceil((1 - discountPrice / price) * 100);
      data.discountPrice = percentDiscount;
    }
    const variant = await Variant.create(data);
    return { variant };
  },
  update: async (id: string, data: UpdateVariantType) => {
    const checkVariant = await Variant.findById(id);
    if (!checkVariant)
      throw ApiError.NotFound("Biến thể sản phẩm không tồn tại");
    const { name, discountPrice, productId, price } = data;
    if (productId) {
      const checkProduct = await Product.findById(productId);
      if (!checkProduct) throw ApiError.NotFound("Sản phẩm không tồn tại");
    }
    if (name) {
      const slug = handleSlugify(name);
      const checkSlug = await Variant.findOne({ slug: slug, _id: { $ne: id } });
      if (checkSlug) throw ApiError.Conflict("Tên biến thể đã tồn tại");
    }
    const finalPrice = price ?? checkVariant.price;
    const finalDiscountPrice = discountPrice ?? checkVariant.discountPrice;
    if (finalDiscountPrice !== undefined) {
      if (finalDiscountPrice > finalPrice)
        throw ApiError.BadRequest(
          "Giá đặc biệt không được lớn hơn giá niêm yết",
        );
      const percentDiscount = Math.ceil(
        (1 - finalDiscountPrice / finalPrice) * 100,
      );
      data.percentDiscount = percentDiscount;
    }
    const variant = await Variant.findByIdAndUpdate(id, data, { new: true });
    return { variant };
  },
  delete: async (id: string) => {
    const deleted = await Variant.findByIdAndDelete(id);
    if (!deleted) throw ApiError.NotFound("Biến thể sản phẩm không tồn tại");
    return { id };
  },
  list: async (query: ListVariantType) => {
    const parserQuery = listVariantQuery(query);
    const { filter, options } = parserQuery;
    const variants = await Variant.find(filter).sort(options.sort);
    return { variants };
  },
};
