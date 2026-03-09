import { ListCategoryTypes } from "../../modules/category/category.types";
import { escapeRegex } from "../escapeRegex";

export const listQueryCategory = (query: ListCategoryTypes) => {
  const { page = 1, limit = 15, search = "", isActive } = query;
  const filter: any = {};
  const options: any = {};
  if (search) {
    const safeSearch = escapeRegex(search.trim());
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { slug: { $regex: safeSearch, $options: "i" } },
    ];
  }
  if (typeof isActive === "boolean") filter.isActive = isActive;
  const sort = { sortOrder: -1 };
  options.sort = sort;
  options.page = page;
  options.limit = limit;
  options.skip = (page - 1) * limit;
  return {
    filter,
    options,
  };
};
