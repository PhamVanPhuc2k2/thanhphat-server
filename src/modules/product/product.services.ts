import {
  CreateProductTypes,
  GetProductsTypes,
  UpdateProductTypes,
} from "./product.types";
import Category from "../category/category.models";
import { ApiError } from "../../utils/apiError";
import Brand from "../brand/brand.models";
import { handleSlugify } from "../../utils/handleSlugify";
import Product from "../product/product.models";
import { redis } from "../../configs/redis";
import Variant from "../variant/variant.models";
import { GetProductsQuery } from "../../utils/query/listProduct.query";
import mongoose from "mongoose";

export const productServices = {
  create: async (data: CreateProductTypes) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { product, variants } = data;
      const checkCategory = await Category.findById(product.categoryId);
      if (!checkCategory)
        throw ApiError.NotFound("Danh mục sản phẩm không tồn tại");
      const checkBrand = await Brand.findById(product.brandId);
      if (!checkBrand)
        throw ApiError.BadRequest("Thương hiệu sản phẩm đã tồn tại");
      const slugProduct = handleSlugify(product.name);
      product.slug = slugProduct;
      const checkProduct = await Product.findOne({ slug: slugProduct });
      if (checkProduct) throw ApiError.Conflict("Tên sản phẩm đã tồn tại");
      const productDoc = await Product.create([product], { session });

      if (variants && variants.length > 0) {
        const names = variants.map((v) => v.name);
        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length)
          throw ApiError.Conflict("Tên biến thể bị trùng trong danh sách");
        const variantData = variants.map((v) => ({
          ...v,
          productId: productDoc[0]._id,
        }));
        await Variant.insertMany(variantData, { session });
      }
      await session.commitTransaction();
      session.endSession();
      return {
        product,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },
  update: async (id: string, data: UpdateProductTypes) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { product, variants } = data;
      const { name, brandId, categoryId } = product;
      const checkProduct = await Product.findById(id).session(session);
      if (!checkProduct) throw ApiError.NotFound("Sản phẩm không tồn tại");
      if (categoryId) {
        const checkCategory =
          await Category.findById(categoryId).session(session);
        if (!checkCategory)
          throw ApiError.NotFound("Danh mục sản phẩm không tồn tại");
      }
      if (brandId) {
        const checkBrand = await Brand.findById(brandId).session(session);
        if (!checkBrand)
          throw ApiError.NotFound("Thương hiệu sản phẩm không tồn tại");
      }
      if (name) {
        const slug = handleSlugify(name);
        const checkName = await Product.findOne({
          slug,
          _id: { $ne: id },
        }).session(session);
        if (checkName) throw ApiError.Conflict("Tên sản phẩm đã tồn tại");
        product.slug = slug;
      }
      await Product.findByIdAndUpdate(id, product, {
        session,
      });
      if (variants && variants.length > 0) {
        const names = variants.map((v) => v.name);
        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length)
          throw ApiError.BadRequest("Tên biến thể trùng lặp trong danh sách");
        const oldVariants = await Variant.find({ productId: id }).session(
          session,
        );
        const newVariants = variants.filter((variant) => !variant._id);

        const updateVariants = variants.filter((v) => v._id);
        const updatedVariants = updateVariants.map((v) => v._id?.toString());
        const deletedVariants = oldVariants.filter(
          (v) => !updatedVariants.includes(v._id.toString()),
        );
        // update
        for (const v of updateVariants) {
          await Variant.findByIdAndUpdate(v._id, v, { session });
        }
        // create
        if (newVariants.length > 0) {
          await Variant.create(
            newVariants.map((v) => ({
              ...v,
              productId: id,
            })),
            { session },
          );
        }
        // delete
        for (const v of deletedVariants) {
          await Variant.findByIdAndDelete(v._id, { session });
        }
      }
      await session.commitTransaction();

      const productDoc = await Product.findById(id);
      const variantDocs = await Variant.find({ productId: id });
      return {
        product: {
          product: productDoc,
          variants: variantDocs,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
  delete: async (id: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const checkProduct = await Product.findById(id).session(session);
      if (!checkProduct) throw ApiError.NotFound("Sản phẩm không tồn tại");
      await Variant.deleteMany({ productId: id }, { session });
      await Product.findByIdAndDelete(id, { session });
      await session.commitTransaction();
      return id;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
  list: async (query: GetProductsTypes) => {
    const parserQuery = GetProductsQuery(query);
    const { filter, options } = parserQuery;
    const products = await Product.find(filter)
      .populate("categoryId", "name")
      .populate("brandId", "name")
      .sort(options.sort)
      .limit(options.limit)
      .skip(options.skip);
    const total = await Product.countDocuments(filter);
    return {
      products,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  },
  detail: async (id: string) => {
    const product = await Product.findById(id)
      .populate({ path: "categoryId", select: "_id name fullPath parentId" })
      .populate({ path: "brandId", select: "_id name" });
    if (!product) throw ApiError.NotFound("Sản phẩm không tồn tại");
    const variants = await Variant.find({ productId: product._id });
    return {
      product: {
        product,
        variants,
      },
    };
  },
};
