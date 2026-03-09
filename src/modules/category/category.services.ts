import { handleSlugify } from "../../utils/handleSlugify";
import {
  AllCategoryTypes,
  CreateCategoryTypes,
  ListCategoryTypes,
  SelectCategoryQueryTypes,
  UpdateCategoryTypes,
} from "./category.types";
import Category from "./category.models";
import { ApiError } from "../../utils/apiError";
import cloudinary from "../../configs/cloudinary";
import { listQueryCategory } from "../../utils/query/listCategory.query";
import { allCategoryQuery } from "../../utils/query/allCategory.query";
import { redis } from "../../configs/redis";
import Product from "../product/product.models";
import { selectCategoryQuery } from "../../utils/query/selectCategory.query";

const MAX_LEVEL = 2;
export const categoryService = {
  create: async (data: CreateCategoryTypes) => {
    const { name, parentId } = data;
    let fullPath: string[] = [];
    let level = 1;
    const slug = handleSlugify(name);
    const checkCategory = await Category.findOne({ slug });
    if (checkCategory) throw ApiError.Conflict("Danh mục đã tồn tại");
    if (parentId) {
      const checkParent = await Category.findById(parentId);
      if (!checkParent) throw ApiError.NotFound("Danh mục cha không tồn tại");
      level = checkParent.level + 1;
      if (level > MAX_LEVEL)
        throw ApiError.BadRequest("Danh mục chỉ cho phép tối đa 2 cấp");
      fullPath = [...checkParent.fullPath, name];
    } else {
      fullPath = [name];
    }
    const category = await Category.create({
      ...data,
      slug,
      level,
      fullPath,
      hasChildren: false,
    });
    if (parentId) {
      await Category.updateOne(
        { _id: parentId },
        { $set: { hasChildren: true } },
      );
    }
    await redis.del("category:menu");
    return { category };
  },
  update: async (id: string, data: UpdateCategoryTypes) => {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.NotFound("Danh mục sản phẩm không tồn tại");
    }

    const oldImage = category.image;
    const oldParentId = category.parentId?.toString() || null;
    const oldName = category.name;

    let finalName = category.name;

    if (data.name && data.name !== oldName) {
      const slug = handleSlugify(data.name);

      const existed = await Category.findOne({ slug });
      if (existed && !existed._id.equals(category._id)) {
        throw ApiError.Conflict("Tên danh mục đã tồn tại");
      }

      category.name = data.name;
      category.slug = slug;
      finalName = data.name;

      category.fullPath = [...category.fullPath.slice(0, -1), finalName];
    }

    if ("parentId" in data) {
      const newParentId = data.parentId?.toString() || null;

      if (newParentId !== oldParentId) {
        const hasChildren = await Category.exists({ parentId: id });

        if (hasChildren) {
          throw ApiError.BadRequest(
            "Không thể thay đổi danh mục cha khi đang có danh mục con",
          );
        }

        if (newParentId === id) {
          throw ApiError.BadRequest("Danh mục không thể là cha của chính nó");
        }

        if (data.parentId === null) {
          category.parentId = null;
          category.level = 1;
          category.fullPath = [finalName];
        } else {
          const parent = await Category.findById(data.parentId);
          if (!parent) {
            throw ApiError.NotFound("Danh mục cha không tồn tại");
          }

          let currentParent: any = parent;
          while (currentParent) {
            if (currentParent._id.equals(category._id)) {
              throw ApiError.BadRequest("Không thể tạo vòng lặp danh mục");
            }
            if (!currentParent.parentId) break;
            currentParent = await Category.findById(currentParent.parentId);
          }

          const newLevel = parent.level + 1;
          if (newLevel > MAX_LEVEL) {
            throw ApiError.BadRequest(
              `Danh mục chỉ cho phép tối đa ${MAX_LEVEL} cấp`,
            );
          }

          category.parentId = parent._id;
          category.level = newLevel;
          category.fullPath = [...parent.fullPath, finalName];
        }
      }
    }

    if (data.image) {
      category.image = data.image;
    }

    if (typeof data.isActive === "boolean") {
      category.isActive = data.isActive;
    }

    if (typeof data.sortOrder === "number") {
      category.sortOrder = data.sortOrder;
    }

    if (data.seo) {
      category.seo = {
        ...(category.seo ?? {}),
        ...data.seo,
      };
    }

    const updatedCategory = await category.save();

    const updateChildren = async (parentDoc: any) => {
      const children = await Category.find({
        parentId: parentDoc._id,
      });

      for (const child of children) {
        child.level = parentDoc.level + 1;
        child.fullPath = [...parentDoc.fullPath, child.name];
        await child.save();
        await updateChildren(child);
      }
    };

    if (
      data.name ||
      ("parentId" in data && oldParentId !== category.parentId?.toString())
    ) {
      await updateChildren(updatedCategory);
    }

    if (category.parentId) {
      await Category.updateOne(
        { _id: category.parentId },
        { $set: { hasChildren: true } },
      );
    }

    if (oldParentId && oldParentId !== category.parentId?.toString()) {
      const stillHasChildren = await Category.exists({
        parentId: oldParentId,
      });

      if (!stillHasChildren) {
        await Category.updateOne(
          { _id: oldParentId },
          { $set: { hasChildren: false } },
        );
      }
    }

    await redis.del("category:menu");

    if (
      oldImage?.public_id &&
      data.image &&
      oldImage.public_id !== category.image?.public_id
    ) {
      await cloudinary.uploader.destroy(oldImage.public_id);
    }

    return { updatedCategory };
  },

  delete: async (id: string) => {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.NotFound("Danh mục không tồn tại");
    }

    const hasChildren = await Category.exists({ parentId: id });
    if (hasChildren) {
      throw ApiError.BadRequest("Không thể xóa danh mục vì nó có danh mục con");
    }

    const hasProduct = await Product.exists({ categoryId: id });
    if (hasProduct) {
      throw ApiError.Conflict("Không thể xóa danh mục vì có sản phẩm");
    }

    const parentId = category.parentId?.toString() || null;

    await Category.findByIdAndDelete(id);

    if (parentId) {
      const stillHasChildren = await Category.exists({
        parentId: parentId,
      });

      if (!stillHasChildren) {
        await Category.updateOne(
          { _id: parentId },
          { $set: { hasChildren: false } },
        );
      }
    }

    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await redis.del("category:menu");

    return id;
  },

  list: async (query: ListCategoryTypes) => {
    const parserQuery = listQueryCategory(query);
    const { filter, options } = parserQuery;
    const list = await Category.find(filter)
      .populate("parentId", "name")
      .sort(options.sort)
      .limit(options.limit)
      .skip(options.skip);
    const total = await Category.countDocuments(filter);
    return {
      categories: list,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  },
  all: async (query: AllCategoryTypes) => {
    const parserQuery = allCategoryQuery(query);
    const { filter, options } = parserQuery;
    const allCategory = await Category.find(filter)
      .sort(options.sort)
      .select("-seo -createdAt -updatedAt -slug");
    return { allCategory };
  },
  detail: async (id: string) => {
    const category = await Category.findById(id).populate("parentId", "name");
    if (!category) throw ApiError.NotFound("Danh mục sản phẩm không tồn tại");
    return { category };
  },
  menu: async () => {
    const cacheKey = "category:menu";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { menu: JSON.parse(cached) };
    }
    const parserQuery = allCategoryQuery({ isActive: false });
    const { filter, options } = parserQuery;
    const menu = await Category.find(filter).sort(options.sort).select({
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
      sortOrder: 0,
      isActive: 0,
      seo: 0,
    });

    await redis.set(cacheKey, JSON.stringify(menu), { EX: 60 * 5 });
    return { menu };
  },
  select: async (query: SelectCategoryQueryTypes) => {
    const parserQuery = selectCategoryQuery(query);
    const { filter, options } = parserQuery;
    const categories = await Category.find(filter)
      .populate("parentId", "name")
      .sort(options.sort);
    const parentId = filter.parentId ?? null;
    return {
      parentId,
      categories,
    };
  },
};
