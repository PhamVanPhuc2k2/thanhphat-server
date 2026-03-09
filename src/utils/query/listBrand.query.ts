import { ListBrandQuery } from "../../modules/brand/brand.types";
import { escapeRegex } from "../escapeRegex";

export const listBrandQuery = (query: ListBrandQuery) => {
  const { page = 1, limit = 10, search = "", isActive } = query;
  const filter: any = {};
  const options: any = {};
  if (search) {
    const safeSearch = escapeRegex((search as string).trim());
    filter.$or = [{ name: { $regex: safeSearch, $options: "i" } }];
  }
  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }
  options.sort = { createdAt: -1 };
  const skip = (page - 1) * limit;
  options.page = page;
  options.limit = limit;
  options.skip = skip;
  return {
    filter,
    options,
  };
};
