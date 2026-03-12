import { ApiError } from "../../utils/apiError";
import { handleSlugify } from "../../utils/handleSlugify";
import {
  CreateArticleType,
  QueryArticleType,
  UpdateArticleType,
} from "./article.types";
import Article from "./article.models";
import { listArticleQuery } from "../../utils/query/listArticle.query";
import cloudinary from "../../configs/cloudinary";

export const articleServices = {
  create: async (data: CreateArticleType) => {
    const { title, isPublished } = data;
    const slug = handleSlugify(title);
    const checkTitle = await Article.findOne({ slug });
    if (checkTitle) throw ApiError.Conflict("Tiêu đề bài viết đã bị trùng");

    const articleData: any = {
      ...data,
      slug,
      viewCount: 0,
    };
    if (isPublished === true) {
      articleData.publishedAt = new Date();
    }
    const article = await Article.create(articleData);
    return { article };
  },
  update: async (id: string, data: UpdateArticleType) => {
    const article = await Article.findById(id);
    if (!article) throw ApiError.NotFound("Bàn viết không không tồn tại");
    const newData: any = {
      ...data,
    };
    if (article.isPublished === false && data.isPublished === true) {
      newData.publishedAt = new Date();
    }
    if (data.title) {
      const slug = handleSlugify(data.title);
      const checkTitle = await Article.findOne({ slug, _id: { $ne: id } });
      if (checkTitle) throw ApiError.Conflict("Tiêu đề bài viết đã tồn tại");
      newData.slug = slug;
    }
    const updated = await Article.findByIdAndUpdate(id, newData, { new: true });
    return { article: updated };
  },
  delete: async (id: string) => {
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle) throw ApiError.NotFound("Bài viết không tồn tại");
    const destroyPromises: Promise<any>[] = [];
    if (deletedArticle.thumbnail?.public_id) {
      destroyPromises.push(cloudinary.uploader.destroy(deletedArticle.thumbnail.public_id));
    }
    if (deletedArticle.images?.length) {
      deletedArticle.images.forEach((img: any) => {
        if (img.public_id) destroyPromises.push(cloudinary.uploader.destroy(img.public_id));
      });
    }
    await Promise.allSettled(destroyPromises);
    return id;
  },
  list: async (query: QueryArticleType) => {
    const parserQuery = listArticleQuery(query);
    const { filters, options } = parserQuery;
    const articles = await Article.find(filters)
      .sort(options.sort)
      .limit(options.limit)
      .skip(options.skip);
    const total = await Article.countDocuments(filters);
    const totalPages = Math.ceil(total / options.limit);
    return {
      articles,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
      },
    };
  },
  detail: async (id: string) => {
    const article = await Article.findById(id);
    if (!article) throw ApiError.NotFound("Bài viết không tồn tại");
    return { article };
  },

  detailBySlug: async (slug: string) => {
    const article = await Article.findOne({ slug, isPublished: true });
    if (!article) throw ApiError.NotFound("Bài viết không tồn tại");
    // Tăng viewCount bất đồng bộ, không block response
    Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } }).exec();
    return { article };
  },
};
