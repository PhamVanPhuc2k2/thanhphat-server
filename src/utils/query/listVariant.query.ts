import { ListVariantType } from "../../modules/variant/variant.types";

export const listVariantQuery = (query: ListVariantType) => {
  const { isActive, productId } = query;
  const filter: any = {};
  const options: any = {};
  if (typeof isActive === "boolean") filter.isActive = isActive;
  options.sort = { createdAt: -1 };
  if (productId) filter.productId = productId;
  return { filter, options };
};
