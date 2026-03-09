import { QueryBannerType } from "../../modules/banner/banner.types";

export const listBannerQuery = (query: QueryBannerType) => {
  const { categoryId, isActive, limit = 10, page = 1 } = query;
  const filter: any = {};
  const options: any = {};
  if (categoryId) filter.categoryId = categoryId;
  if (typeof isActive === "boolean") filter.isActive = isActive;
  const skip = (page - 1) * limit;
  options.sort = { createdAt: -1 };
  options.skip = skip;
  options.limit = limit;
  options.page = page;
  return {
    filter,
    options,
  };
};
