import z from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string(),
    logo: z.object({
      url: z.string(),
      public_id: z.string(),
    }),
    isActive: z.boolean(),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    logo: z
      .object({
        url: z.string(),
        public_id: z.string(),
      })
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteBrandSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const getBrandsSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const getBrandSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
});

export const GetAllBrandSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z
    .object({
      isActive: z.enum(["true", "false"]).transform((val) => val === "true"),
    })
    .optional(),
});
