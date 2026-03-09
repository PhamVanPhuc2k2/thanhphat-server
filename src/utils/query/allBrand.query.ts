import { AllBrandQuery } from "../../modules/brand/brand.types";

export const allBrandQuery = (query: AllBrandQuery) => {
  const { isActive } = query;
  const filter: any = {};
  const options: any = {};
  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }
  options.sort = { createdAt: -1 };
  return { filter, options };
};
