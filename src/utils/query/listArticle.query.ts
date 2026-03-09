import { QueryArticleType } from "../../modules/article/article.types";
import { escapeRegex } from "../escapeRegex";

export const listArticleQuery = (query: QueryArticleType) => {
  const { isPublished, limit = 10, page = 1, search } = query;
  const filters: any = {};
  const options: any = {};
  if (search) {
    const safeSearch = escapeRegex(search.trim());
    filters.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { slug: { $regex: safeSearch, $options: "i" } },
    ];
  }
  if (typeof isPublished === "boolean") {
    filters.isPublish = isPublished;
  }
  options.sort = { viewCount: -1 };
  options.page = page;
  options.limit = limit;
  options.skip = (page - 1) * limit;
  return {
    filters,
    options,
  };
};
