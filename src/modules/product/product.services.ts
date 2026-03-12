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
import { escapeRegex } from "../../utils/escapeRegex";
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
        throw ApiError.NotFound("Thương hiệu sản phẩm không tồn tại");
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
  publicList: async (query: Record<string, unknown>) => {
    const { page = 1, limit = 20, search, category, brand, sort } = query as {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      brand?: string;
      sort?: string;
    };
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const matchStage: Record<string, unknown> = { isActive: true };

    if (search) {
      const safe = escapeRegex(String(search).trim());
      matchStage.$or = [
        { name: { $regex: safe, $options: "i" } },
        { slug: { $regex: safe, $options: "i" } },
      ];
    }
    if (category) {
      const cat = await Category.findOne({ slug: String(category), isActive: true });
      if (!cat) return { products: [], pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
      matchStage.categoryId = cat._id;
    }
    if (brand) {
      const br = await Brand.findOne({ slug: String(brand), isActive: true });
      if (!br) return { products: [], pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
      matchStage.brandId = br._id;
    }

    const total = await Product.countDocuments(matchStage);
    let sortStage: Record<string, number> = { createdAt: -1 };
    if (sort === "price_asc") sortStage = { price: 1, createdAt: -1 };
    else if (sort === "price_desc") sortStage = { price: -1, createdAt: -1 };

    const pipeline: object[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "variants",
          let: { pid: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$productId", "$$pid"] }, { $eq: ["$isActive", true] }] } } },
            { $sort: { discountPrice: 1 } },
          ],
          as: "variants",
        },
      },
      {
        $addFields: {
          price: { $ifNull: [{ $first: "$variants.discountPrice" }, 0] },
          oldPrice: { $ifNull: [{ $first: "$variants.price" }, 0] },
          discountPercent: { $ifNull: [{ $first: "$variants.percentDiscount" }, 0] },
          stock: { $sum: "$variants.stock" },
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limitNum },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1, slug: 1 } }],
          as: "_cat",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1, slug: 1, logo: 1 } }],
          as: "_brand",
        },
      },
      {
        $addFields: {
          categoryId: { $first: "$_cat" },
          brandId: { $first: "$_brand" },
        },
      },
      { $project: { variants: 0, _cat: 0, _brand: 0 } },
    ];

    const products = await Product.aggregate(pipeline);
    return {
      products,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    };
  },
  publicDetail: async (slug: string) => {
    const product = await Product.findOne({ slug, isActive: true })
      .populate({ path: "categoryId", select: "_id name slug" })
      .populate({ path: "brandId", select: "_id name slug logo" })
      .lean();
    if (!product) throw ApiError.NotFound("Sản phẩm không tồn tại");

    const variants = await Variant.find({ productId: product._id, isActive: true }).lean();
    const categoryObjId = (product.categoryId as { _id: mongoose.Types.ObjectId } | null)?._id ?? product.categoryId;
    const relatedRaw = await Product.find({ categoryId: categoryObjId, isActive: true, _id: { $ne: product._id } })
      .populate({ path: "brandId", select: "_id name slug logo" })
      .limit(8)
      .lean();

    const relatedProducts = await Promise.all(
      relatedRaw.map(async (rp) => {
        const v = await Variant.findOne({ productId: rp._id, isActive: true }).sort({ discountPrice: 1 }).lean();
        const allV = await Variant.find({ productId: rp._id, isActive: true }).lean();
        return { ...rp, price: v?.discountPrice ?? 0, oldPrice: v?.price ?? 0, discountPercent: v?.percentDiscount ?? 0, stock: allV.reduce((s, x) => s + x.stock, 0) };
      }),
    );

    return { product, variants, relatedProducts };
  },
};
