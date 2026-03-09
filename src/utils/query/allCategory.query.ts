import { AllCategoryTypes } from "../../modules/category/category.types";

export const allCategoryQuery = (query: AllCategoryTypes) => {
  const { isActive, level, hasChildren } = query;
  const filter: any = {};
  const options: any = {};
  if (typeof isActive === "boolean") filter.isActive = isActive;
  if (typeof hasChildren === "boolean") filter.hasChildren = hasChildren;
  if (typeof level === "number") filter.level = level;
  options.sort = { sortOrder: -1 };
  return { filter, options };
};
