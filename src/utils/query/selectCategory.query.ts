import { SelectCategoryQueryTypes } from "../../modules/category/category.types";

export const selectCategoryQuery = (query: SelectCategoryQueryTypes) => {
  const { parentId, isActive } = query;
  const filter: any = {};
  const options: any = {};
  if (parentId !== undefined) filter.parentId = parentId;
  if (typeof isActive === "boolean") filter.isActive = isActive;
  options.sort = { sortOrder: 1 };
  return { filter, options };
};
