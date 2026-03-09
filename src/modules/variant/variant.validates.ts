import z from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

export const CreateVariantSchema = z.object({
  body: z.object({
    name: z.string(),
    productId: z.string(),
    sku: z.string(),
    price: z.number(),
    discountPrice: z.number().optional(),
    stock: z.number(),
    images: z.array(z.object({ url: z.string(), public_id: z.string() })),
    isActive: z.boolean(),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const UpdateVariantSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    productId: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().optional(),
    discountPrice: z.number().optional(),
    stock: z.number().optional(),
    images: z
      .array(z.object({ url: z.string(), public_id: z.string() }))
      .optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const DeleteVariantSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const ListVariantSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    productId: z.string().optional(),
    isActive: z.enum(["true", "false"]).transform((val) => val === "true"),
  }),
});
